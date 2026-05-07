from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os, pickle, math, collections, sys, re, time, uuid
from backend.services.groq_llm import analyze_message_with_llama
from backend.services.ai_truth import ai_engine, blockchain, records_db, TRUSTED_DEVICES, compute_sha256
from datetime import datetime, timezone

# ── Stop Words ──
STOP_WORDS = {"a","an","the","and","or","but","if","then","else","at","by","for","with","about","against",
              "between","into","through","during","before","after","above","below","to","from","up","down",
              "in","out","on","off","over","under","again","further","once","here","there","when","where",
              "why","how","all","any","both","each","few","more","most","other","some","such","no","nor",
              "not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now"}

def tokenize(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    words = text.split()
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]

class CustomTFIDF:
    def __init__(self):
        self.vocab = {}; self.idf = {}; self.num_docs = 0
    def transform(self, documents):
        rows = []
        for doc in documents:
            words = tokenize(doc)
            tf = collections.Counter(words)
            doc_len = len(words) if len(words) > 0 else 1
            vector = [0.0] * len(self.vocab)
            for word, count in tf.items():
                if word in self.vocab:
                    idx = self.vocab[word]
                    vector[idx] = (count / doc_len) * self.idf[word]
            norm = math.sqrt(sum(v**2 for v in vector))
            if norm > 0: vector = [v/norm for v in vector]
            rows.append(vector)
        return rows

class CustomNaiveBayes:
    def __init__(self):
        self.class_probs = {}; self.feature_probs = {}; self.classes = []
    def predict_proba(self, X):
        predictions = []
        for doc in X:
            scores = {}
            for c in self.classes:
                score = self.class_probs[c]
                for j, val in enumerate(doc):
                    if val > 0:
                        score += val * 10
                        score += self.feature_probs[c][j]
                scores[c] = score
            max_score = max(scores.values())
            exp_scores = {c: math.exp(score - max_score) for c, score in scores.items()}
            sum_exp = sum(exp_scores.values())
            predictions.append({c: e/sum_exp for c, e in exp_scores.items()})
        return predictions

sys.modules['__main__'].CustomTFIDF = CustomTFIDF
sys.modules['__main__'].CustomNaiveBayes = CustomNaiveBayes

# ── FastAPI App ──
app = FastAPI(title="FraudGuard AI — Unified Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Load ML Models ──
backend_dir = os.path.dirname(os.path.abspath(__file__))
tfidf_path = os.path.join(backend_dir, "ml_models", "tfidf.pkl")
nb_path    = os.path.join(backend_dir, "ml_models", "naive_bayes.pkl")

tfidf = nb_model = None
try:
    with open(tfidf_path, "rb") as f: tfidf = pickle.load(f)
    with open(nb_path,    "rb") as f: nb_model = pickle.load(f)
    print("✅ ML models loaded successfully")
except Exception as e:
    print(f"⚠️  ML models failed to load: {e}")

# ── Models ──
class MessageRequest(BaseModel):
    message: str

# ── Endpoints ──

@app.post("/predict")
def predict_fraud(req: MessageRequest):
    if not tfidf or not nb_model:
        raise HTTPException(status_code=500, detail="ML Models not loaded on server.")
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    X = tfidf.transform([req.message])
    probs = nb_model.predict_proba(X)[0]

    try:
        smart = analyze_message_with_llama(req.message)
        llm_is_fraud = smart.get("is_fraud", False)
        llm_score    = smart.get("confidence_score", 50.0)
        explanation  = smart.get("explanation", "Analysis complete.")

        ml_fraud_prob  = probs.get(1, 0.5) * 100
        final_prob     = (llm_score if llm_is_fraud else (100 - llm_score)) * 0.90 + ml_fraud_prob * 0.10
        is_fraud       = final_prob > 50.0
        confidence     = round(final_prob if is_fraud else (100 - final_prob), 2)
    except Exception as e:
        is_fraud    = probs[1] > 0.5
        confidence  = round(probs[1]*100, 2) if is_fraud else round(probs[0]*100, 2)
        explanation = f"[Fallback ML only — LLM error: {e}]"

    return {"is_fraud": is_fraud, "confidence_score": confidence, "explanation": explanation}


@app.post("/api/media/analyze")
async def analyze_media(file: UploadFile = File(...), device_id: str = Form("DEV-UNKNOWN")):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file.")

    t0 = time.time()

    content_hash = compute_sha256(file_bytes)
    device_info  = TRUSTED_DEVICES.get(device_id, TRUSTED_DEVICES["DEV-UNKNOWN"])
    import hashlib
    device_sig   = hashlib.sha256(f"{device_id}{content_hash}".encode()).hexdigest()

    capture = {
        "device_id": device_id,
        "device_make": device_info["make"],
        "device_model": device_info["model"],
        "device_certified": device_info["certified"],
        "tee_backed": device_info["tee"],
        "content_hash": content_hash,
        "device_signature": device_sig,
        "capture_time": datetime.now(timezone.utc).isoformat(),
        "pki_verified": device_info["certified"],
    }

    ai_result = ai_engine.analyze(file_bytes, file.filename)

    ledger_record = {
        "type": "CONTENT_VERIFICATION",
        "content_hash": content_hash,
        "filename": file.filename,
        "device_id": device_id,
        "ai_confidence": ai_result["ensemble_confidence"],
        "verdict": ai_result["verdict"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    block = blockchain.add_record(ledger_record)
    merkle_root = blockchain.merkle_roots[-1] if blockchain.merkle_roots else "N/A"

    ledger = {
        "block_index": block.index,
        "block_hash": block.hash,
        "prev_hash": block.prev_hash,
        "merkle_root": merkle_root,
        "chain_valid": blockchain.verify_chain(),
        "chain_length": len(blockchain.chain),
        "anchored_to": "Ethereum L2 (Polygon) — Simulated",
    }

    existing     = blockchain.find_record(content_hash)
    hash_match   = existing is not None
    ai_pass      = ai_result["ensemble_confidence"] >= 0.55
    device_trust = device_info["certified"]

    if hash_match and ai_pass and device_trust:
        trust_level, trust_score = "VERIFIED", 3
    elif (hash_match or ai_pass) and device_trust:
        trust_level, trust_score = "PARTIAL", 2
    elif ai_pass:
        trust_level, trust_score = "AI-ONLY", 1
    else:
        trust_level, trust_score = "UNVERIFIED", 0

    distribution = {
        "three_way_match": {
            "content_hash_match": hash_match,
            "ai_confidence_pass": ai_pass,
            "device_origin_trusted": device_trust,
        },
        "trust_level": trust_level,
        "trust_score": trust_score,
        "c2pa_compatible": True,
        "badge": trust_level,
        "verification_url": f"http://localhost:8000/api/media/verify?hash={content_hash[:16]}",
    }

    full_record = {
        "id": str(uuid.uuid4()),
        "filename": file.filename,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "elapsed_ms": round((time.time() - t0) * 1000, 1),
        "capture": capture,
        "verification": ai_result,
        "ledger": ledger,
        "distribution": distribution,
    }

    records_db[content_hash] = full_record
    return full_record


@app.get("/api/media/verify")
def verify_media(hash: str):
    for k, v in records_db.items():
        if k.startswith(hash) or hash.startswith(k[:16]):
            return {"found": True, "record": v}
    return {"found": False, "message": "Hash not found in ledger"}

@app.get("/api/media/blockchain")
def get_blockchain():
    return {
        "chain": [b.to_dict() for b in blockchain.chain[-20:]],
        "length": len(blockchain.chain),
        "valid": blockchain.verify_chain()
    }

@app.get("/api/media/records")
def get_records():
    return {"records": list(records_db.values()), "total": len(records_db)}

@app.get("/api/media/stats")
def get_stats():
    total = len(records_db)
    return {
        "total_analyzed": total,
        "verified": sum(1 for r in records_db.values() if r["distribution"]["trust_level"] == "VERIFIED"),
        "suspicious": sum(1 for r in records_db.values() if r["verification"]["verdict"] in ("SUSPICIOUS", "SYNTHETIC / MANIPULATED")),
        "chain_length": len(blockchain.chain),
        "chain_valid": blockchain.verify_chain(),
    }

@app.get("/health")
def health():
    return {"status": "online", "ml_models": tfidf is not None, "blockchain_length": len(blockchain.chain)}

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html><head><title>FraudGuard AI | Backend Active</title>
    <style>
      body{font-family:-apple-system,sans-serif;background:#050810;color:#c8d8f0;
           display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
      .card{background:#0b1220;padding:2.5rem;border-radius:1.5rem;text-align:center;
            border:1px solid #1a2840;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);}
      h1{margin:0;color:#00e5ff;font-size:2rem;}
      p{color:#7a9bbf;margin:10px 0 20px;}
      .status{display:inline-block;padding:5px 15px;background:#002a1a;
              color:#00ff94;border-radius:100px;font-weight:bold;font-size:0.8rem;}
    </style></head>
    <body><div class="card">
      <div class="status">● SYSTEM LIVE</div>
      <h1>FraudGuard AI — Unified Backend</h1>
      <p>Hybrid ML + Llama + AI Truth Protocol v2.0</p>
    </div></body></html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
