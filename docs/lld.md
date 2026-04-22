# 🛠️ Low-Level Design (LLD)

The LLD dives into the actual coding structure, folder layout, modules, and functions we will build.

### 1. Directory Structure
Here is exactly how your VS Code workspace will look:

```text
fraud_detection_project/
│
├── app.py                     # Main Flask Application
├── requirements.txt           # List of dependencies (Flask, scikit-learn, groq, etc.)
│
├── data/
│   └── dummy_dataset.csv      # The dummy CSV dataset we will create
│
├── ml_models/                 # The Traditional ML Pipeline
│   ├── model_trainer.py       # Script to train NB & LR models
│   ├── tfidf_vectorizer.pkl   # Saved TF-IDF vocabulary
│   └── naive_bayes.pkl        # Saved trained ML model
│
├── services/                  # External services / APIs
│   └── groq_llm.py            # Code to connect to Groq/Meta Llama API
│
├── templates/
│   └── index.html             # The Frontend UI
│
└── static/
    └── style.css              # Styling for the UI
```

### 2. Module & Function Definitions

#### Module 1: `ml_models/model_trainer.py`
This script is run once. It trains your ML models on the dummy dataset.
*   `load_data(filepath)`: Reads the dummy CSV using Pandas.
*   `preprocess_text(text)`: Removes stop words, punctuation, and URLs.
*   `train_models(df)`: 
    *   Applies `TfidfVectorizer`.
    *   Splits data using `train_test_split`.
    *   Trains `MultinomialNB()` and `LogisticRegression()`.
    *   Saves the best model using the `pickle` library.

#### Module 2: `services/groq_llm.py`
This module handles the advanced open-source LLM logic.
*   **Function:** `analyze_message_with_llama(message)`
*   **Logic:** Uses the Groq Python SDK. It passes a prompt like: *"Analyze this SMS: [message]. Is it a scam? Explain in 2 sentences why."* using a fast open-source model like `llama3-8b-8192`.
*   **Output:** Returns a short string explanation.

#### Module 3: `app.py` (Main Flask Server)
This is the heart of the project.
*   **Function:** `home()`
    *   *Route:* `/`
    *   *Logic:* Renders `index.html`.
*   **Function:** `predict()`
    *   *Route:* `/predict` (POST method)
    *   *Logic:*
        1. Gets text from the form.
        2. Cleans text using a helper function.
        3. Transforms text using loaded `tfidf_vectorizer.pkl`.
        4. Predicts using `naive_bayes.pkl` (Returns: Fraud or Safe).
        5. Calls `analyze_message_with_llama()` from `services` to get the explanation.
        6. Returns the final Prediction + Explanation to the UI.

### 3. Data Schema (Dummy Dataset)
Since we are using a dummy dataset, the data structure will be very simple.

| Feature Name | Data Type | Description |
| :--- | :--- | :--- |
| `Label` | Integer | `1` means Fraud/Spam, `0` means Safe/Ham. |
| `Message` | String | The raw text of the SMS. |
| `Length` | Integer | *(Optional)* Number of characters in the message. |

