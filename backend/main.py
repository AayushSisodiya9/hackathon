import os
import json
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import urllib.request
import urllib.parse
import urllib.error

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# You will need to set your Gemini API key as an environment variable
# e.g., setx GEMINI_API_KEY "your_api_key_here"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    
class AnalysisResponse(BaseModel):
    filename: str
    behavioral_dna: dict
    evolution_tree: dict
    threat_score: int
    recommendations: list[str]

@app.get("/")
def read_root():
    return {"message": "Welcome to the EvoMal AI Backend API"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_apk(file: UploadFile = File(...)):
    # Save the file temporarily
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # In a real app, you would run static analysis tools (androguard, etc.) here.
    # For the hackathon, we will extract basic metadata and use Gemini to generate the forecast.
    file_size = os.path.getsize(file_path)
    
    # Prompt Gemini for the forecast
    prompt = f"""
    You are 'EvoMal AI', a highly advanced system that predicts malware evolution.
    I am uploading a new Android malware sample. You must generate a highly unique, creative, and predictive threat intelligence report for this specific file.
    
    Filename: {file.filename}
    File size: {file_size} bytes
    
    CRITICAL: DO NOT COPY THE VALUES FROM THE EXAMPLE BELOW. You MUST invent completely new, unique values, different threat scores (between 40 and 99), different DNA percentages, and a completely unique evolution tree based on what kind of malware you think '{file.filename}' might be. 
    
    Respond ONLY with a valid JSON object. Here is the SCHEMA you must follow (but change all the actual values/text):
    {{
        "behavioral_dna": {{
            "Accessibility Abuse": <random_number_0_to_100>,
            "Overlay Attacks": <random_number_0_to_100>,
            "Payload Loading": <random_number_0_to_100>,
            "Credential Theft": <random_number_0_to_100>
        }},
        "evolution_tree": {{
            "root": "<Invent a root node name based on the filename>",
            "branches": [
                {{"target": "<Invent future mutation 1>", "sub_branches": ["<Invent specific tactic A>"]}},
                {{"target": "<Invent future mutation 2>", "sub_branches": ["<Invent specific tactic B>", "<Invent specific tactic C>"]}}
            ]
        }},
        "threat_score": <random_number_40_to_99>,
        "recommendations": [
            "<Invent proactive defense 1>",
            "<Invent proactive defense 2>",
            "<Invent proactive defense 3>"
        ]
    }}
    
    Make it highly realistic for cybersecurity professionals. Do not include markdown blocks like ```json in the response, just the raw JSON text.
    """
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        data = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}]
        }).encode('utf-8')
        
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            resp_data = response.read()
            resp_json = json.loads(resp_data)
            result_text = resp_json['candidates'][0]['content']['parts'][0]['text'].strip()
        
        # Remove any potential markdown formatting from Gemini
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
            
        parsed_result = json.loads(result_text)
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Fallback dummy data if API fails
        parsed_result = {
            "behavioral_dna": {"Accessibility Abuse": 80, "Overlay Attacks": 50, "Payload Loading": 60, "Credential Theft": 40},
            "evolution_tree": {
                "root": f"Unknown Sample ({file.filename})",
                "branches": [
                    {"target": "Data Exfiltration", "sub_branches": ["Contact List Theft"]}
                ]
            },
            "threat_score": 75,
            "recommendations": ["Monitor Network Traffic", "Enforce Strict Permissions"]
        }
        
    # Clean up the file
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {
        "filename": file.filename,
        "behavioral_dna": parsed_result.get("behavioral_dna", {}),
        "evolution_tree": parsed_result.get("evolution_tree", {}),
        "threat_score": parsed_result.get("threat_score", 0),
        "recommendations": parsed_result.get("recommendations", [])
    }
