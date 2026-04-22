import os
import json
from groq import Groq

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

print("🔧 [GROQ SERVICE INIT]")
api_key = os.environ.get("GROQ_API_KEY")
print(f"  - GROQ_API_KEY configured: {bool(api_key)}")
if api_key:
    print(f"  - API key preview: {api_key[:10]}...{api_key[-5:]}")

# Do not initialize the client immediately if key is missing, to prevent app crash
client = None
if api_key:
    client = Groq(api_key=api_key)
print("✅ Groq client initialized\n")

def analyze_message_with_llama(message: str) -> dict:
    """
    Analyzes message for fraud, phishing, and misinformation.
    Returns: {is_fraud: bool, confidence_score: float, explanation: str}
    """
    print("  🌐 [GROQ SMART ANALYZER INITIATED]")
    
    if not api_key:
        return {
            "is_fraud": False,
            "confidence_score": 0.0,
            "explanation": "Groq API key missing."
        }

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an Advanced AI designed to detect Fraud, Misinformation, and Nonsense in text messages. "
                        "Follow these RULES strictly:\n"
                        "1. If a statement is factually incorrect (e.g., 'Australia is a state of India'), set is_fraud to TRUE and confidence_score to 95-100.\n"
                        "2. If a statement is highly political, speculative, defamatory, or abusive (e.g., 'X person is gay' or 'Y person will be Prime Minister'), flag it as misinformation. Set is_fraud to TRUE and confidence_score to 90-100.\n"
                        "3. If a statement is clearly a scam/phishing attempt (e.g., 'You won $1000', 'Account locked'), set is_fraud to TRUE and confidence_score to 90-100.\n"
                        "4. If a statement is a normal, harmless conversational text, set is_fraud to FALSE and confidence_score to 90-100.\n"
                        "5. If it is ambiguous like 'Hello world', set is_fraud to FALSE and confidence_score to 50-70.\n"
                        "Provide a brief 1-2 sentence explanation. Return ONLY JSON:\n"
                        '{"is_fraud": boolean, "confidence_score": float, "explanation": "string"}'
                    )
                },
                {
                    "role": "user",
                    "content": f"Analyze: \"{message}\"",
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
            temperature=0.0, # Zero temperature for absolute consistency and factual scoring
        )
        
        raw_response = chat_completion.choices[0].message.content.strip()
        analysis = json.loads(raw_response)
        print(f"    ✅ Smart analysis complete: Fraud={analysis.get('is_fraud')}, Score={analysis.get('confidence_score')}%")
        return analysis
        
    except Exception as e:
        print(f"    ❌ Smart analysis failed: {str(e)}")
        return {
            "is_fraud": False,
            "confidence_score": 50.0,
            "explanation": f"Error in smart analysis: {str(e)}"
        }
