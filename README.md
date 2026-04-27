# Malicious Checker

An AI-powered scam/phishing detection tool using a fine-tuned BERT model.  
Supports **text analysis** and **image analysis** (via OCR).

---

## Model

**Model:** [`ealvaradob/bert-finetuned-phishing`](https://huggingface.co/ealvaradob/bert-finetuned-phishing)  
**License:** Apache 2.0  
**Accuracy:** ~97.17%

### Download the model

Run this once from the project root to download the model into the exact `Models/` directory the backend expects:

```powershell
python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='ealvaradob/bert-finetuned-phishing', cache_dir='./Models')"
```

This saves the model to:
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

> `huggingface_hub` is installed automatically as a dependency of `transformers`.

---

## Backend Setup

```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### Virtual Environment (recommended)

This project uses a shared virtual environment at `C:\Users\shaya\Desktop\True_VENV`.  
Activate it before installing or running:

```powershell
C:\Users\shaya\Desktop\True_VENV\Scripts\Activate.ps1
```

---

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Running the Full Stack

Open two terminals and run both simultaneously:

**Terminal 1 — Backend:**
```powershell
C:\Users\shaya\Desktop\True_VENV\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

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
