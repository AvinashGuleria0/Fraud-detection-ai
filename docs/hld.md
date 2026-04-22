# 🏗️ High-Level Design (HLD)

The HLD provides a birds-eye view of the system architecture. It outlines how the different components communicate with each other.

### 1. System Architecture
We are using a **Client-Server Architecture** with an external API integration.

*   **Client (Frontend):** A web interface built with HTML/CSS where the user inputs the SMS text.
*   **Server (Backend):** A Python **Flask** application that processes requests.
*   **Processing Engines (Inside Flask):**
    *   *Traditional ML Engine:* Uses pre-trained `.pkl` models (Scikit-learn: Naive Bayes/Logistic Regression) and TF-IDF for instant classification.
    *   *LLM Engine:* Uses the **Groq API** (running Meta Llama 3) to analyze the message for context, intent, and explainability.

### 2. High-Level Architecture Flow Diagram
```text[ Web Browser (User) ] 
       │
       │ (1) Enters SMS Message & clicks "Analyze"
       ▼
[ Flask Backend (app.py) ] 
       │
       ├──► (2) Text Preprocessing (NLTK / Regex)
       │
       ├──► (3) Traditional ML Route:
       │        ├─► TF-IDF Vectorizer
       │        ├─► Naive Bayes / Logistic Regression
       │        └─► Result: Spam (98% confidence)
       │
       └──► (4) LLM / Groq Route:
                ├─► Sends message text to Groq API (Meta Llama)
                └─► Result: "This is a phishing attempt. It uses false urgency."
       │
       ▼
[ Flask Backend Aggregates Results ]
       │
       │ (5) Sends combined JSON/HTML back to User
       ▼[ Web Browser displays Prediction + Explanation ]
```
