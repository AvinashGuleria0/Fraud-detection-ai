from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import pickle
import math
import collections
import sys

# Import the service for the LLM
from services.groq_llm import analyze_message_with_llama

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
    allow_origins=["*"], # For production, restrict to your React app domain
    allow_credentials=True,
    allow_methods=["*"],
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
except FileNotFoundError as e:
    print(f"❌ Warning: ML models not found. Run model_trainer.py first.")
    print(f"   Error: {str(e)}\n")
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

@app.get("/")
def home():
    return {"message": "Fraud Detection API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
