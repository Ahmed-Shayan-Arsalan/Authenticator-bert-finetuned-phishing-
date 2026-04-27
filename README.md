# Malicious Checker

An AI-powered scam/phishing detection tool using a fine-tuned BERT model.  
Supports **text analysis** and **image analysis** (via OCR).

---

## Quick Start — Run These Commands First

> **Do this once when you first clone/open the project.**  
> Open a terminal in the project root and run each block in order.

### 1. Download the AI Model

> Run from the **project root** (`Malicious_Checker/`), not inside any subfolder.

```powershell
pip install huggingface_hub
python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='ealvaradob/bert-finetuned-phishing', cache_dir='./Models')"
```

### 2. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

---

## Running the App

> Open **two separate terminals** — one for the backend, one for the frontend.

**Terminal 1 — Backend:**
```powershell
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

- Backend API: `http://localhost:8000`
- Frontend app: `http://localhost:3000`

---

## Model Info

**Model:** [`ealvaradob/bert-finetuned-phishing`](https://huggingface.co/ealvaradob/bert-finetuned-phishing)  
**License:** Apache 2.0 | **Accuracy:** ~97.17%

The model is downloaded into:
```
Models/
└── models--ealvaradob--bert-finetuned-phishing/
    └── snapshots/
        └── fa8fb73a007174c410ab7160d4e4c6e6b8d998d4/
            ├── config.json
            ├── pytorch_model.bin
            ├── tokenizer.json
            ├── tokenizer_config.json
            ├── special_tokens_map.json
            └── vocab.txt
```

> The `Models/` folder is excluded from git. You must download the model locally.

---

## Project Structure

```
Malicious_Checker/
├── backend/
│   ├── main.py              # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── AboutPanel.tsx
│   │   ├── TextAnalyzePanel.tsx
│   │   ├── AnalyzePanel.tsx
│   │   ├── UrlAnalyzePanel.tsx
│   │   └── SignalsBreakdown.tsx
│   ├── next.config.mjs
│   └── package.json
├── Models/                  # BERT model cache (not committed to git)
└── README.md
```
