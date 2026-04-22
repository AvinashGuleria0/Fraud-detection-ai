## 📖 1. Project Overview

### Problem Statement
Fraudulent SMS messages such as fake bank alerts, lottery scams, OTP fraud, and phishing messages are increasing rapidly. Many users cannot easily identify these scams, which leads to financial loss and severe security risks. Therefore, a highly accurate, automated system is needed to detect, classify, and explain fraudulent messages in real-time.

### Objectives
*   **Automated Detection:** Detect fraudulent SMS messages instantly.
*   **Accurate Classification:** Classify messages strictly into **Spam/Fraud** or **Legitimate/Safe**.
*   **Hybrid AI Approach:** Use Traditional Machine Learning (Naive Bayes/Logistic Regression) coupled with Natural Language Processing (NLP) for fast detection, and Open-Source LLMs (Meta Llama via Groq) for Explainable AI.
*   **User-Friendly Web Interface:** Provide a simple, intuitive frontend for users to test suspicious messages.

---

## 🌟 2. Novelty Factor & Unique Enhancements
While standard spam detectors rely solely on basic keyword filtering or traditional ML, our system introduces an **Interdisciplinary Innovation** by combining ML, NLP, Web Development, and Generative AI:
1.  **Hybrid Processing Engine:** Blends statistical ML accuracy with LLM context-awareness.
2.  **Explainable AI (XAI):** Not only does it tell the user a message is a scam, but it uses Groq (Meta Llama) to explain *why* (e.g., "This message contains a fake URL and creates a false sense of urgency").
3.  **Real-Time Probability Scoring:** Displays the mathematical confidence of the ML model.

---

## 🛠️ 3. Technology Stack

*   **Programming Language:** Python 3.x
*   **Data Manipulation:** `Pandas`, `NumPy`
*   **Natural Language Processing (NLP):** `NLTK`, Regular Expressions (`re`)
*   **Machine Learning (Scikit-Learn):** `TfidfVectorizer`, `MultinomialNB` (Naive Bayes), `LogisticRegression`
*   **Large Language Models (LLM):** `Groq API` (Running Open-Source Meta Llama 3 for Explainable AI)
*   **Backend Framework:** `Flask`
*   **Frontend UI:** `HTML5`, `CSS3`, `Jinja2` (Template Engine)
*   **Development Tools:** VS Code, Jupyter Notebook

---

## 🏗️ 4. System Architecture (High-Level Design)

The system follows a **Client-Server Architecture**. 

1.  **User Input:** The user pastes an SMS text into the HTML Frontend.
2.  **Backend Processing:** The Flask server receives the text and passes it through a text preprocessing pipeline (removing noise, stopwords, and punctuation).
3.  **Dual-Engine Analysis:**
    *   **Engine A (Traditional ML):** The text is converted into a mathematical vector using TF-IDF. The pre-trained Naive Bayes/Logistic Regression model evaluates the vector and returns a Probability Score (e.g., 96% Fraud).
    *   **Engine B (Explainable LLM):** Simultaneously, the text is sent via API to Groq (Llama). The LLM analyzes the text's context and generates a human-readable explanation of the threat.
4.  **Aggregation & Output:** Flask combines the probability score and the LLM explanation and renders it back to the user interface.

---

## 📂 5. Folder Structure (Low-Level Design)

```text
fraud_detection_project/
│
├── app.py                     # Main Flask Application & Server Configuration
├── requirements.txt           # Python dependencies
│
├── data/
│   └── dummy_dataset.csv      # Custom curated dataset containing Fraud/Safe SMS samples
│
├── ml_models/                 
│   ├── model_trainer.py       # Script for data loading, preprocessing, and training ML models
│   ├── tfidf_vectorizer.pkl   # Serialized TF-IDF vocabulary (Saved state)
│   └── naive_bayes.pkl        # Serialized Naive Bayes model (Saved state)
│   └── logistic_reg.pkl       # Serialized Logistic Regression model (Saved state)
│
├── services/                  
│   └── groq_llm.py            # Module handling Groq API connections & Prompt Engineering
│
├── templates/
│   └── index.html             # Main Web Interface (UI)
│
└── static/
    └── style.css              # UI Styling, responsive design
```

---

## ⚙️ 6. Core Modules & Workflow

### A. Data Collection & Preprocessing
Since real-world telecom data is restricted, the project utilizes a highly curated **Dummy Dataset** (`dummy_dataset.csv`) modeling real-life phishing attempts, bank alerts, and casual conversations.
*   **Text Cleaning:** Conversion to lowercase.
*   **Tokenization:** Splitting sentences into words.
*   **Stopword Removal:** Eliminating common, non-informative words (e.g., "is", "the").
*   **Regex Filtering:** Replacing URLs with a standard `<httpaddr>` tag and masking phone numbers.

### B. Feature Extraction
*   **TF-IDF (Term Frequency-Inverse Document Frequency):** Assigns mathematical weight to words. Rare but critical words (like "lottery", "OTP", "urgent") receive higher scores than frequent, generic words.

### C. Model Training & Evaluation
*   Both **Naive Bayes** and **Logistic Regression** are trained on an 80/20 train-test split. 
*   Models are evaluated on Accuracy, Precision, Recall, and F1-Score. The best performing model is serialized into a `.pkl` file for production use.

### D. Explainable AI via Groq
*   **Prompt Engineering Structure:** `"Analyze this SMS: [USER_INPUT]. Classify it as Spam or Safe, and provide a 2-sentence explanation of the potential threat."`
*   The Groq API ensures ultra-fast, low-latency LLM inference, ensuring the user gets an explanation in milliseconds without slowing down the web app.

---

## 🌍 7. Sustainable Development Goals (SDG) Mapping

This project actively contributes to global sustainability and security standards:
*   **SDG 9 (Industry, Innovation, and Infrastructure):** Promotes innovation in cybersecurity technology by developing automated threat-detection mechanisms.
*   **SDG 16 (Peace, Justice, and Strong Institutions):** Protects citizens from cybercrime, financial fraud, and identity theft, contributing to a safer digital society.

---

## ⚠️ 8. Challenges, Risks, and Mitigation

| Identified Risk | Mitigation Strategy |
| :--- | :--- |
| **Imbalanced Dataset** (More safe messages than spam) | Use of stratified sampling and adjusting class weights in Logistic Regression. |
| **Short or Misleading Messages** | Hybrid LLM integration provides contextual understanding where traditional ML might fail. |
| **Model Overfitting** | Implementing Cross-Validation (K-Fold) and tuning model hyperparameters during training. |
| **Evolving Fraud Patterns** | Continuous dataset updates; utilizing the LLM's vast pre-trained knowledge to catch zero-day phishing formats. |

---

## 🚀 9. Project Timeline & Next Steps

*   **Phase 1:** Research, Requirements Gathering, and Architecture Design (DFDs & Use Case Diagrams). *(Completed)*
*   **Phase 2:** Dummy dataset creation and Text Preprocessing pipeline development. *(In Progress)*
*   **Phase 3:** Training Naive Bayes & Logistic Regression models; comparing accuracy metrics.
*   **Phase 4:** Developing the Flask Backend and integrating the Groq LLM API.
*   **Phase 5:** Designing the Frontend UI (HTML/CSS) and linking it to the Flask server.
*   **Phase 6:** Comprehensive System Testing, Risk Mitigation, and Final Project Demonstration preparation.
```