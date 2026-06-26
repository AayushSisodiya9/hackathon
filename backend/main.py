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

from fastapi.responses import JSONResponse

@app.post("/analyze")
async def analyze_apk(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        from androguard.core.apk import APK
        # Extract real features using Androguard
        try:
            a = APK(file_path)
            permissions = a.get_permissions()
            activities = a.get_activities()
            services = a.get_services()
            receivers = a.get_receivers()
        except Exception as apk_err:
            raise Exception(f"Failed to parse APK file. Ensure it is a valid Android package. Details: {apk_err}")
            
        # Limit the lists to avoid context window overflow
        permissions_str = ", ".join(permissions)[:1000] if permissions else "None"
        activities_str = ", ".join(activities)[:1000] if activities else "None"
        services_str = ", ".join(services)[:1000] if services else "None"
        receivers_str = ", ".join(receivers)[:1000] if receivers else "None"
        
        prompt = f"""
        You are 'EvoMal AI', a highly advanced system that predicts malware evolution.
        I have extracted the following static analysis data from an Android APK file named '{file.filename}'.
        
        Requested Permissions: {permissions_str}
        Activities: {activities_str}
        Services: {services_str}
        Receivers: {receivers_str}
        
        Analyze these features to determine the malware's capabilities, threat level, and potential future mutations.
        Respond ONLY with a valid JSON object matching this exact SCHEMA:
        {{
            "behavioral_dna": {{
                "Accessibility Abuse": <number_0_to_100>,
                "Overlay Attacks": <number_0_to_100>,
                "Payload Loading": <number_0_to_100>,
                "Credential Theft": <number_0_to_100>
            }},
            "evolution_tree": {{
                "root": "<Determine root node name based on extracted features>",
                "branches": [
                    {{"target": "<Predicted future mutation 1>", "sub_branches": ["<Specific tactic A>"]}},
                    {{"target": "<Predicted future mutation 2>", "sub_branches": ["<Specific tactic B>", "<Specific tactic C>"]}}
                ]
            }},
            "threat_score": <number_0_to_100>,
            "recommendations": [
                "<Proactive defense 1>",
                "<Proactive defense 2>",
                "<Proactive defense 3>"
            ]
        }}
        
        Make it highly realistic for cybersecurity professionals. Do not include markdown blocks like ```json in the response, just the raw JSON text.
        """
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        data = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}]
        }).encode('utf-8')
        
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            resp_data = response.read()
            resp_json = json.loads(resp_data)
            result_text = resp_json['candidates'][0]['content']['parts'][0]['text'].strip()
            
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
            
        parsed_result = json.loads(result_text)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {
            "filename": file.filename,
            "behavioral_dna": parsed_result.get("behavioral_dna", {}),
            "evolution_tree": parsed_result.get("evolution_tree", {}),
            "threat_score": parsed_result.get("threat_score", 0),
            "recommendations": parsed_result.get("recommendations", [])
        }
        
    except urllib.error.HTTPError as he:
        if os.path.exists(file_path):
            os.remove(file_path)
        err_msg = he.read().decode('utf-8')
        return JSONResponse(status_code=500, content={"error": f"LLM API Error (HTTP {he.code}): {err_msg}"})
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return JSONResponse(status_code=500, content={"error": f"Failed to analyze APK: {str(e)}"})
