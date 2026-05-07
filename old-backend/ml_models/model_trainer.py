import math
import collections
import pickle
import re

# Basic English Stop Words
STOP_WORDS = {"a", "an", "the", "and", "or", "but", "if", "then", "else", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"}

def tokenize(text):
    # Lowercase, remove punctuation and numbers, then split
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    words = text.split()
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]

class CustomTFIDF:
    def __init__(self):
        self.vocab = {}
        self.idf = {}
        self.num_docs = 0

    def fit(self, documents):
        self.num_docs = len(documents)
        df = collections.defaultdict(int)
        
        # Build vocabulary and doc frequency
        for doc in documents:
            words = tokenize(doc)
            unique_words = set(words)
            for word in unique_words:
                if word not in self.vocab:
                    self.vocab[word] = len(self.vocab)
                df[word] += 1
                
        # Compute IDF (with smoothing)
        for word, count in df.items():
            self.idf[word] = math.log((self.num_docs) / (count)) + 1
            
        return self

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
        
    def fit(self, X, y):
        self.classes = list(set(y))
        num_docs = len(y)
        num_features = len(X[0]) if X else 0
        
        class_counts = collections.Counter(y)
        
        for c in self.classes:
            # Priors
            self.class_probs[c] = math.log(class_counts[c] / num_docs)
            self.feature_probs[c] = [0.0] * num_features
            
            class_docs = [X[i] for i in range(num_docs) if y[i] == c]
            
            # Sum feature values for this class (with Laplace smoothing)
            total_sum = 0
            for j in range(num_features):
                feature_sum = sum(doc[j] for doc in class_docs) + 0.1 # Reduced smoothing for sharper confidence
                self.feature_probs[c][j] = feature_sum
                total_sum += feature_sum
                
            # Log probabilities
            for j in range(num_features):
                self.feature_probs[c][j] = math.log(self.feature_probs[c][j] / total_sum)
                
    def predict_proba(self, X):
        predictions = []
        for doc in X:
            scores = {}
            for c in self.classes:
                # Add class prior
                score = self.class_probs[c]
                # Add feature probabilities
                for j, val in enumerate(doc):
                    if val > 0: 
                        score += val * 10 # Scale the influence of words
                        score += self.feature_probs[c][j]
                scores[c] = score
                
            # Convert log scores to probabilities
            max_score = max(scores.values())
            exp_scores = {c: math.exp(score - max_score) for c, score in scores.items()}
            sum_exp = sum(exp_scores.values())
            
            probs = {c: exp_score / sum_exp for c, exp_score in exp_scores.items()}
            predictions.append(probs)
            
        return predictions

if __name__ == "__main__":
    import csv
    import os
    
    # Get the directory where the script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Data is in backend/data (one level up from ml_models)
    data_path = os.path.join(os.path.dirname(current_dir), "data", "dummy_dataset.csv")
    
    print(f"Training custom ML models from {data_path}...")
    
    if not os.path.exists(data_path):
        print(f"❌ Error: Dataset not found at {data_path}")
        exit(1)
    
    texts = []
    labels = []
    with open(data_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader) # skip header
        for row in reader:
            if len(row) >= 2:
                labels.append(int(row[0]))
                texts.append(row[1])
                
    # Initialize and train
    tfidf = CustomTFIDF()
    tfidf.fit(texts)
    X = tfidf.transform(texts)
    
    nb = CustomNaiveBayes()
    nb.fit(X, labels)
    
    # Save models in the same directory as the script
    with open(os.path.join(current_dir, "tfidf.pkl"), "wb") as f:
        pickle.dump(tfidf, f)
        
    with open(os.path.join(current_dir, "naive_bayes.pkl"), "wb") as f:
        pickle.dump(nb, f)
        
    print(f"✅ Training complete. Vocabulary size: {len(tfidf.vocab)}")
    print(f"✅ Models saved to {current_dir}")
