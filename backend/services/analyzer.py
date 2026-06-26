import os
import json
import logging
from typing import Dict, Any

try:
    from androguard.core.apk import APK
except ImportError:
    pass

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class EvoMalAnalyzer:
    def __init__(self):
        """Initializes the analyzer with the OpenAI API key."""
        self.api_key = os.environ.get("OPENAI_API_KEY")
        
    def parse_apk(self, file_path: str) -> Dict[str, Any]:
        """
        Extracts real structural features from the uploaded APK using androguard.
        Targets specific high-risk permissions and components.
        """
        try:
            logger.info(f"Starting APK static extraction for: {file_path}")
            a = APK(file_path)
            
            package_name = a.get_package()
            target_sdk = a.get_target_sdk_version()
            permissions = a.get_permissions() or []
            
            activities = a.get_activities() or []
            services = a.get_services() or []
            receivers = a.get_receivers() or []
            
            # Filter specifically for high-risk pairs
            high_risk_signatures = [
                "android.permission.RECEIVE_SMS", 
                "android.permission.READ_SMS", 
                "android.permission.BIND_ACCESSIBILITY_SERVICE", 
                "android.permission.SYSTEM_ALERT_WINDOW"
            ]
            found_risks = [p for p in permissions if p in high_risk_signatures]
            
            return {
                "package_name": package_name,
                "target_sdk": target_sdk,
                "permissions_count": len(permissions),
                "high_risk_detected": found_risks,
                "activities_count": len(activities),
                "services_count": len(services),
                "receivers_count": len(receivers)
            }
        except Exception as e:
            # Propagate error up strictly, no mock data
            raise RuntimeError(f"APK parsing failed: {str(e)}")

    def build_markdown_context(self, features: Dict[str, Any]) -> str:
        """
        Compiles extracted structural components into a clean, prioritized markdown string
        to optimize token usage and prevent context window overflow.
        """
        md = f"### APK Structural Analysis Report\n\n"
        md += f"**Package Name:** {features.get('package_name', 'Unknown')}\n"
        md += f"**Target SDK Version:** {features.get('target_sdk', 'Unknown')}\n"
        md += f"**High-Risk Permissions Found:** {', '.join(features.get('high_risk_detected', [])) if features.get('high_risk_detected') else 'None'}\n"
        md += f"**Total Permissions Requested:** {features.get('permissions_count', 0)}\n"
        md += f"**Component Summary:** {features.get('activities_count', 0)} Activities, {features.get('services_count', 0)} Services, {features.get('receivers_count', 0)} Receivers\n"
        return md

    def orchestrate_genai(self, context: str) -> Dict[str, Any]:
        """
        Orchestrates the GenAI API call with strict JSON formatting and system prompt instructions.
        """
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not configured.")
            
        system_prompt = (
            "You are an advanced malware geneticist and Elite Cybersecurity Architect specializing in Banking Fraud Mitigation. "
            "Analyze the provided APK structural components. Based on the extracted permissions and current Android OS version "
            "security restrictions, forecast the next 2 evolutionary mutation steps a fraudster would take. "
            "You MUST return the output strictly in JSON format matching this exact schema:\n\n"
            "{\n"
            "  \"behavioral_dna\": {\"Accessibility Abuse\": <0-100>, \"Overlay Attacks\": <0-100>, \"Payload Loading\": <0-100>, \"Credential Theft\": <0-100>},\n"
            "  \"evolution_tree\": {\n"
            "       \"root\": \"<description of current variant>\",\n"
            "       \"branches\": [\n"
            "           {\"target\": \"<predicted mutation 1>\", \"sub_branches\": [\"<tactic>\"]},\n"
            "           {\"target\": \"<predicted mutation 2>\", \"sub_branches\": [\"<tactic>\"]}\n"
            "       ]\n"
            "  },\n"
            "  \"threat_score\": <integer 1-100>,\n"
            "  \"recommendations\": [\"<proactive defensive strategy 1>\", \"<strategy 2>\"]\n"
            "}"
        )
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            
            logger.info("Sending context to LLM for mutation forecasting...")
            response = client.chat.completions.create(
                model="gpt-4-turbo",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": context}
                ]
            )
            
            result = response.choices[0].message.content
            return json.loads(result)
        except Exception as e:
            raise RuntimeError(f"LLM Orchestration failed: {str(e)}")

    def analyze(self, file_path: str) -> Dict[str, Any]:
        """
        Main pipeline execution. If any step fails, an absolute error JSON is returned.
        """
        try:
            # 1. Extract Real Features
            features = self.parse_apk(file_path)
            
            # 2. Context Optimization
            context_md = self.build_markdown_context(features)
            
            # 3 & 4 & 5. GenAI Orchestration, Prompt Engineering & JSON Schema Output
            analysis_result = self.orchestrate_genai(context_md)
            return analysis_result
            
        except Exception as e:
            # 6. Absolute Error Handling
            logger.error(f"Analysis Pipeline Error: {str(e)}")
            return {
                "status": "error", 
                "message": str(e)
            }
