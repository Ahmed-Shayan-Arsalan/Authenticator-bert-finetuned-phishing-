import os
import io
import re
from urllib.parse import urlparse

import httpx
import numpy as np
import easyocr
from bs4 import BeautifulSoup
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="Malicious Checker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve model path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SNAPSHOTS_DIR = os.path.join(
    BASE_DIR, "..", "Models",
    "models--ealvaradob--bert-finetuned-phishing",
    "snapshots"
)
snapshots = sorted(os.listdir(SNAPSHOTS_DIR))
MODEL_PATH = os.path.join(SNAPSHOTS_DIR, snapshots[-1])

print(f"Loading BERT model from: {MODEL_PATH}")
classifier = pipeline("text-classification", model=MODEL_PATH)

print("Loading OCR reader (first run downloads EasyOCR weights)...")
reader = easyocr.Reader(["en"], gpu=False)

print("Backend ready.")

# ---------------------------------------------------------------------------
# Signal extraction helpers
# ---------------------------------------------------------------------------

URGENCY_PHRASES = [
    "immediately", "urgent", "as soon as possible", "right away",
    "within 24 hours", "within 48 hours", "act now", "don't delay",
    "expires today", "expires soon", "last chance", "final notice",
    "respond now", "limited time", "today only",
]

THREAT_PHRASES = [
    "suspended", "suspension", "terminate", "terminated", "legal action",
    "arrest", "penalty", "penalties", "warrant", "lawsuit", "prosecuted",
    "account closed", "account locked", "account disabled", "blocked",
    "late fee", "late fees", "overdue", "unpaid",
]

URL_RE = re.compile(
    r"https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?",
    re.IGNORECASE,
)
PHONE_RE = re.compile(
    r"\+?[\d\s\-\(\)]{7,15}\d",
)


def extract_signals(text: str) -> dict:
    lower = text.lower()
    words = text.split()

    # URLs
    urls = URL_RE.findall(text)

    # Phone numbers (crude but useful)
    phones = PHONE_RE.findall(text)

    # Urgency / threat keyword hits
    urgency_hits = [p for p in URGENCY_PHRASES if p in lower]
    threat_hits = [p for p in THREAT_PHRASES if p in lower]

    # Caps ratio (words that are fully uppercase, length > 2)
    caps_words = [w for w in words if w.isalpha() and w.isupper() and len(w) > 2]
    caps_ratio = round(len(caps_words) / max(len(words), 1) * 100, 1)

    # Punctuation counts
    exclamation_count = text.count("!")
    question_count = text.count("?")

    return {
        "urls": urls[:10],  # cap at 10
        "phones": [p.strip() for p in phones[:5]],
        "urgency_keywords": urgency_hits,
        "threat_keywords": threat_hits,
        "caps_ratio": caps_ratio,
        "exclamation_marks": exclamation_count,
        "word_count": len(words),
    }


def classify_text(text: str) -> dict:
    """Run BERT classifier and return normalized result."""
    raw = classifier(text, truncation=True, max_length=512)[0]
    label_raw = raw["label"].lower()
    is_phishing = "phish" in label_raw or label_raw == "label_1"
    return {
        "label": "phishing" if is_phishing else "legitimate",
        "score": round(raw["score"] * 100, 2),
    }


# --- Models ---

class TextRequest(BaseModel):
    text: str


class UrlRequest(BaseModel):
    url: str


# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze/text")
async def analyze_text(body: TextRequest):
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")
    if len(text) > 10000:
        raise HTTPException(status_code=400, detail="Input too long. Maximum 10,000 characters.")

    result = classify_text(text)
    signals = extract_signals(text)
    return {
        "label": result["label"],
        "score": result["score"],
        "input_text": text,
        "signals": signals,
    }


@app.post("/analyze/url")
async def analyze_url(body: UrlRequest):
    raw_url = body.url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    # Validate scheme — only allow http/https to prevent SSRF via other protocols
    parsed = urlparse(raw_url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=400,
            detail="Only http:// and https:// URLs are supported.",
        )
    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL — no host found.")

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            headers={"User-Agent": "Mozilla/5.0 (compatible; MaliciousChecker/1.0)"},
        ) as client:
            response = await client.get(raw_url)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timed out fetching the URL.")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Could not reach URL: {exc}")

    content_type = response.headers.get("content-type", "")
    if "text" not in content_type and "html" not in content_type:
        raise HTTPException(
            status_code=422,
            detail=f"URL did not return HTML/text content (got: {content_type}).",
        )

    soup = BeautifulSoup(response.text, "html.parser")
    # Remove script / style / meta noise
    for tag in soup(["script", "style", "noscript", "head", "meta", "link"]):
        tag.decompose()
    extracted_text = " ".join(soup.get_text(separator=" ").split())

    if not extracted_text:
        return {
            "label": "unknown",
            "score": 0.0,
            "url": raw_url,
            "extracted_text": "",
            "signals": None,
            "message": "No readable text could be extracted from the page.",
        }

    # Truncate to 10 000 chars to stay within BERT token limits
    truncated = extracted_text[:10000]

    result = classify_text(truncated)
    signals = extract_signals(truncated)
    return {
        "label": result["label"],
        "score": result["score"],
        "url": raw_url,
        "extracted_text": truncated,
        "signals": signals,
    }


@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    contents = await file.read()

    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image_np = np.array(image)
    ocr_results = reader.readtext(image_np, detail=0)
    extracted_text = " ".join(ocr_results).strip()

    if not extracted_text:
        return {
            "label": "unknown",
            "score": 0.0,
            "extracted_text": "",
            "signals": None,
            "message": "No text could be extracted from the image.",
        }

    result = classify_text(extracted_text)
    signals = extract_signals(extracted_text)
    return {
        "label": result["label"],
        "score": result["score"],
        "extracted_text": extracted_text,
        "signals": signals,
    }
