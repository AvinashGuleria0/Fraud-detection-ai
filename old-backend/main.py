from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import pickle
import math
import collections
import sys

# Import the service for the LLM
from services.groq_llm import analyze_message_with_llama
from services.ai_truth import ai_engine, blockchain, records_db, TRUSTED_DEVICES, compute_sha256
from datetime import datetime, timezone
import time
import uuid

import re

# Basic English Stop Words
STOP_WORDS = {"a", "an", "the", "and", "or", "but", "if", "then", "else", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"}

def tokenize(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    words = text.split()
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]

# --- Load the custom classes for unpickling to work ---
class CustomTFIDF:
    def __init__(self):
        self.vocab = {}
        self.idf = {}
        self.num_docs = 0

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
                    term_freq = count / doc_len
                    vector[idx] = term_freq * self.idf[word]
                    
            # Normalize vector (L2 norm)
            norm = math.sqrt(sum(v**2 for v in vector))
            if norm > 0:
                vector = [v/norm for v in vector]
            rows.append(vector)
            
        return rows

class CustomNaiveBayes:
    def __init__(self):
        self.class_probs = {}
        self.feature_probs = {}
        self.classes = []
        
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
            
            probs = {c: exp_score / sum_exp for c, exp_score in exp_scores.items()}
            predictions.append(probs)
            
        return predictions

sys.modules['__main__'].CustomTFIDF = CustomTFIDF
sys.modules['__main__'].CustomNaiveBayes = CustomNaiveBayes

# --- FastAPI Initialization ---
app = FastAPI(title="Fraud Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Load Models
# Get the absolute path to the backend directory (where this script is located)
backend_dir = os.path.dirname(os.path.abspath(__file__))
tfidf_path = os.path.join(backend_dir, "ml_models", "tfidf.pkl")
nb_path = os.path.join(backend_dir, "ml_models", "naive_bayes.pkl")

print(f"📂 Backend directory: {backend_dir}")
print(f"📂 Looking for TF-IDF model at: {tfidf_path}")
print(f"📂 Looking for Naive Bayes model at: {nb_path}")

try:
    print(f"📖 Loading TF-IDF model...")
    with open(tfidf_path, "rb") as f:
        tfidf = pickle.load(f)
    print(f"✅ TF-IDF model loaded successfully")
    
    print(f"📖 Loading Naive Bayes model...")
    with open(nb_path, "rb") as f:
        nb_model = pickle.load(f)
    print(f"✅ Naive Bayes model loaded successfully\n")
except Exception as e:
    print(f"❌ Warning: ML models failed to load. The app will continue, but ML predictions will be disabled.")
    print(f"   Error details: {str(e)}\n")
    tfidf = None
    nb_model = None

class MessageRequest(BaseModel):
    message: str

@app.post("/predict")
def predict_fraud(req: MessageRequest):
    print("\n" + "="*80)
    print("🚀 [PREDICT ENDPOINT CALLED]")
    print("="*80)
    
    try:
        # ===== STEP 1: Validate Models =====
        print("📋 STEP 1: Validating ML models...")
        print(f"  - tfidf loaded: {tfidf is not None}")
        print(f"  - nb_model loaded: {nb_model is not None}")
        
        if not tfidf or not nb_model:
            error_msg = "ML Models are not loaded on server."
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        print("✅ Models validated successfully")
        
        # ===== STEP 2: Validate Input =====
        print("\n📋 STEP 2: Validating input message...")
        print(f"  - Message length: {len(req.message)} chars")
        print(f"  - Message preview: {req.message[:100]}...")
        
        if not req.message.strip():
            error_msg = "Message cannot be empty."
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        print("✅ Message validated")
        
        # ===== STEP 3: TF-IDF Transform =====
        print("\n📋 STEP 3: Running TF-IDF transformation...")
        try:
            X = tfidf.transform([req.message])
            print(f"✅ TF-IDF transform successful")
            print(f"  - Feature vector length: {len(X[0]) if X else 0}")
            print(f"  - Vector preview (first 5 values): {X[0][:5] if X and X[0] else 'N/A'}")
        except Exception as e:
            print(f"❌ TF-IDF transform failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TF-IDF transform error: {str(e)}")
        
        # ===== STEP 4: Naive Bayes Prediction =====
        print("\n📋 STEP 4: Running Naive Bayes prediction...")
        try:
            probs = nb_model.predict_proba(X)[0]
            print(f"✅ Naive Bayes prediction successful")
            print(f"  - Probability of non-fraud (class 0): {probs.get(0, 'N/A'):.4f}")
            print(f"  - Probability of fraud (class 1): {probs.get(1, 'N/A'):.4f}")
        except Exception as e:
            print(f"❌ Naive Bayes prediction failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Naive Bayes prediction error: {str(e)}")
        
        # ===== STEP 5: Calculate Confidence =====
        print("\n📋 STEP 5: Calculating confidence score...")
        try:
            is_fraud = probs[1] > 0.5
            confidence_score = round(probs[1] * 100, 2) if is_fraud else round(probs[0] * 100, 2)
            print(f"✅ Confidence calculation successful")
            print(f"  - is_fraud: {is_fraud}")
            print(f"  - confidence_score: {confidence_score}%")
        except Exception as e:
            print(f"❌ Confidence calculation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Confidence calculation error: {str(e)}")
        
        # ===== STEP 6: Call Smart LLM Analysis =====
        print("\n📋 STEP 6: Calling Smart LLM Analysis...")
        try:
            smart_analysis = analyze_message_with_llama(req.message)
            llm_is_fraud = smart_analysis.get("is_fraud", False)
            llm_score = smart_analysis.get("confidence_score", 50.0)
            explanation = smart_analysis.get("explanation", "Reasoning complete.")
            
            # ===== STEP 7: Hybrid Intelligence Fusion =====
            print("\n📋 STEP 7: Fusing ML and LLM results...")
            
            # Convert probabilities to 0-100 scale for comparison
            ml_fraud_prob = probs.get(1, 0.5) * 100
            
            # Since the LLM is now explicitly checking facts/politics/misinformation with high precision,
            # we give the LLM 90% weight and the older ML pattern matcher only 10% weight.
            # This ensures if LLM says "100% fake", the final score will be close to 100%.
            final_fraud_prob = (llm_score if llm_is_fraud else (100 - llm_score)) * 0.90 + ml_fraud_prob * 0.10
            
            is_fraud = final_fraud_prob > 50.0
            confidence_score = round(final_fraud_prob if is_fraud else (100 - final_fraud_prob), 2)

            print(f"✅ Intelligence fusion complete")
            print(f"  - ML Probability: {ml_fraud_prob:.2f}%")
            print(f"  - LLM Smart Score: {llm_score:.2f}% (Given 90% influence)")
            print(f"  - Final Combined Score: {confidence_score}%")
            
        except Exception as e:
            print(f"❌ Smart analysis fusion failed: {str(e)}")
            is_fraud = probs[1] > 0.5
            confidence_score = round(probs[1] * 100, 2) if is_fraud else round(probs[0] * 100, 2)
            explanation = f"[Fallback due to error: {str(e)}]"
        
        # ===== STEP 8: Prepare Response =====
        response_data = {
            "is_fraud": is_fraud,
            "confidence_score": confidence_score,
            "explanation": explanation
        }
        
        print("\n✅ [SMART PREDICT ENDPOINT SUCCESS]")
        print("="*80 + "\n")
        
        return response_data
        
    except HTTPException as http_err:
        print(f"\n❌ [HTTP EXCEPTION]: {http_err.detail}")
        print("="*80 + "\n")
        raise
    except Exception as e:
        print(f"\n❌ [UNEXPECTED ERROR]: {str(e)}")
        import traceback
        print(traceback.format_exc())
        print("="*80 + "\n")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/media/analyze")
async def analyze_media(file: UploadFile = File(...), device_id: str = Form("DEV-UNKNOWN")):
    print("\n" + "="*80)
    print("🚀 [MEDIA ANALYZE ENDPOINT CALLED]")
    print(f"  - Filename: {file.filename}")
    print(f"  - Device ID: {device_id}")
    
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    t0 = time.time()

    # ── Layer 1: Capture ──
    content_hash = compute_sha256(file_bytes)
    device_info  = TRUSTED_DEVICES.get(device_id, TRUSTED_DEVICES["DEV-UNKNOWN"])
    import hashlib
    device_sig   = hashlib.sha256(f"{device_id}{content_hash}".encode()).hexdigest()

    capture = {
        "device_id":     device_id,
        "device_make":   device_info["make"],
        "device_model":  device_info["model"],
        "device_certified": device_info["certified"],
        "tee_backed":    device_info["tee"],
        "content_hash":  content_hash,
        "device_signature": device_sig,
        "capture_time":  datetime.now(timezone.utc).isoformat(),
        "pki_verified":  device_info["certified"],
    }

    # ── Layer 2: AI Verification ──
    ai_result = ai_engine.analyze(file_bytes, file.filename)

    # ── Layer 3: Ledger ──
    ledger_record = {
        "type":              "CONTENT_VERIFICATION",
        "content_hash":      content_hash,
        "filename":          file.filename,
        "device_id":         device_id,
        "ai_confidence":     ai_result["ensemble_confidence"],
        "verdict":           ai_result["verdict"],
        "timestamp":         datetime.now(timezone.utc).isoformat(),
    }
    block = blockchain.add_record(ledger_record)
    merkle_root = blockchain.merkle_roots[-1] if blockchain.merkle_roots else "N/A"

    ledger = {
        "block_index":    block.index,
        "block_hash":     block.hash,
        "prev_hash":      block.prev_hash,
        "merkle_root":    merkle_root,
        "chain_valid":    blockchain.verify_chain(),
        "chain_length":   len(blockchain.chain),
        "anchored_to":    "Ethereum L2 (Polygon) — Simulated",
    }

    # ── Layer 4: Distribution / Three-Way Match ──
    existing = blockchain.find_record(content_hash)
    hash_match    = existing is not None
    ai_pass       = ai_result["ensemble_confidence"] >= 0.55
    device_trust  = device_info["certified"]

    if hash_match and ai_pass and device_trust:
        trust_level = "VERIFIED"
        trust_score = 3
    elif (hash_match or ai_pass) and device_trust:
        trust_level = "PARTIAL"
        trust_score = 2
    elif ai_pass:
        trust_level = "AI-ONLY"
        trust_score = 1
    else:
        trust_level = "UNVERIFIED"
        trust_score = 0

    distribution = {
        "three_way_match": {
            "content_hash_match": hash_match,
            "ai_confidence_pass": ai_pass,
            "device_origin_trusted": device_trust,
        },
        "trust_level":  trust_level,
        "trust_score":  trust_score,
        "c2pa_compatible": True,
        "badge": trust_level,
        "verification_url": f"http://localhost:8000/api/media/verify?hash={content_hash[:16]}",
    }

    elapsed = round((time.time() - t0) * 1000, 1)

    full_record = {
        "id":           str(uuid.uuid4()),
        "filename":     file.filename,
        "timestamp":    datetime.now(timezone.utc).isoformat(),
        "elapsed_ms":   elapsed,
        "capture":      capture,
        "verification": ai_result,
        "ledger":       ledger,
        "distribution": distribution,
    }

    records_db[content_hash] = full_record
    
    print("\n✅ [MEDIA ANALYZE ENDPOINT SUCCESS]")
    print(f"  - Verdict: {ai_result['verdict']} ({ai_result['ensemble_confidence']})")
    print("="*80 + "\n")
    
    return full_record

@app.get("/api/media/verify")
def verify_media(hash: str):
    match = None
    for k, v in records_db.items():
        if k.startswith(hash) or hash.startswith(k[:16]):
            match = v
            break

    if match:
        return {"found": True, "record": match}
    else:
        return {"found": False, "message": "Hash not found in ledger"}

@app.get("/api/media/blockchain")
def get_blockchain():
    chain_data = [b.to_dict() for b in blockchain.chain[-20:]]
    return {"chain": chain_data, "length": len(blockchain.chain), "valid": blockchain.verify_chain()}

@app.get("/api/media/records")
def get_records():
    return {"records": list(records_db.values()), "total": len(records_db)}

@app.get("/api/media/stats")
def get_stats():
    total = len(records_db)
    verified = sum(1 for r in records_db.values() if r["distribution"]["trust_level"] == "VERIFIED")
    suspicious = sum(1 for r in records_db.values() if r["verification"]["verdict"] in ("SUSPICIOUS", "SYNTHETIC / MANIPULATED"))
    return {
        "total_analyzed": total,
        "verified": verified,
        "suspicious": suspicious,
        "chain_length": len(blockchain.chain),
        "chain_valid": blockchain.verify_chain(),
    }

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html>
        <head>
            <title>FraudGuard AI | Active</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                    background: #0f172a; color: white; display: flex; align-items: center; 
                    justify-content: center; height: 100vh; margin: 0; 
                }
                .card { 
                    background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; 
                    text-align: center; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                h1 { margin: 0; color: #8b5cf6; font-size: 2rem; }
                p { color: #94a3b8; margin: 10px 0 20px; }
                .status { 
                    display: inline-block; padding: 5px 15px; background: #065f46; 
                    color: #34d399; border-radius: 100px; font-weight: bold; font-size: 0.8rem;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="status">● SYSTEM LIVE</div>
                <h1>FraudGuard AI Backend</h1>
                <p>Hybrid ML + Llama Intelligence is ready.</p>
            </div>
        </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
