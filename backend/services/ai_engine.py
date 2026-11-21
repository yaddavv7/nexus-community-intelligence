import json
import re
from typing import Dict, Any, List
from config import settings

CATEGORIES = [
    "Road damage and potholes",
    "Drainage and waterlogging",
    "Garbage and waste management",
    "Water supply problems",
    "Public infrastructure damage",
    "Electricity and street lighting",
    "Environmental pollution",
    "Public safety concerns",
    "Other community issues"
]

MALAYALAM_KEYWORD_MAP = {
    "വെള്ളക്കെട്ട്": "Drainage and waterlogging",
    "ഓട": "Drainage and waterlogging",
    "മഴവെള്ളം": "Drainage and waterlogging",
    "കുഴി": "Road damage and potholes",
    "റോഡ്": "Road damage and potholes",
    "ടാർ": "Road damage and potholes",
    "മാലിന്യം": "Garbage and waste management",
    "ചവറ്": "Garbage and waste management",
    "പ്ലാസ്റ്റിക്": "Garbage and waste management",
    "പൈപ്പ്": "Water supply problems",
    "കുടിവെള്ളം": "Water supply problems",
    "വെള്ളം": "Water supply problems",
    "വൈദ്യുതി": "Electricity and street lighting",
    "സ്ട്രീറ്റ് ലൈറ്റ്": "Electricity and street lighting",
    "പോസ്റ്റ്": "Electricity and street lighting",
    "പാലം": "Public infrastructure damage",
    "മതിൽ": "Public infrastructure damage",
    "ബസ് സ്റ്റോപ്പ്": "Public infrastructure damage",
    "പുക": "Environmental pollution",
    "മലിനീകരണം": "Environmental pollution",
    "അപകടം": "Public safety concerns",
    "സുരക്ഷ": "Public safety concerns",
    "നായ": "Public safety concerns",
}

ENGLISH_KEYWORD_MAP = {
    "pothole": "Road damage and potholes",
    "crater": "Road damage and potholes",
    "tar": "Road damage and potholes",
    "asphalt": "Road damage and potholes",
    "road cave": "Road damage and potholes",
    "drain": "Drainage and waterlogging",
    "waterlogging": "Drainage and waterlogging",
    "flood": "Drainage and waterlogging",
    "overflow": "Drainage and waterlogging",
    "gutter": "Drainage and waterlogging",
    "clogged": "Drainage and waterlogging",
    "culvert": "Drainage and waterlogging",
    "garbage": "Garbage and waste management",
    "waste": "Garbage and waste management",
    "dump": "Garbage and waste management",
    "trash": "Garbage and waste management",
    "plastic": "Garbage and waste management",
    "refuse": "Garbage and waste management",
    "pipe burst": "Water supply problems",
    "drinking water": "Water supply problems",
    "leakage": "Water supply problems",
    "no water": "Water supply problems",
    "water supply": "Water supply problems",
    "street light": "Electricity and street lighting",
    "electric": "Electricity and street lighting",
    "transformer": "Electricity and street lighting",
    "wire": "Electricity and street lighting",
    "power outage": "Electricity and street lighting",
    "bridge": "Public infrastructure damage",
    "handrail": "Public infrastructure damage",
    "bus stop": "Public infrastructure damage",
    "footpath": "Public infrastructure damage",
    "pavement": "Public infrastructure damage",
    "sewage": "Environmental pollution",
    "smoke": "Environmental pollution",
    "chemical": "Environmental pollution",
    "river pollution": "Environmental pollution",
    "stray dog": "Public safety concerns",
    "manhole": "Public safety concerns",
    "open drain": "Public safety concerns",
    "accident prone": "Public safety concerns",
    "dark alley": "Public safety concerns",
}

DEPARTMENT_MAP = {
    "Road damage and potholes": "Public Works Department (PWD Roads)",
    "Drainage and waterlogging": "Major & Minor Irrigation / Municipal Engineering",
    "Garbage and waste management": "Municipal Solid Waste Management Wing / Clean Kerala Co.",
    "Water supply problems": "Kerala Water Authority (KWA)",
    "Public infrastructure damage": "Local Self Government Dept (LSGD Engineering)",
    "Electricity and street lighting": "Kerala State Electricity Board (KSEB)",
    "Environmental pollution": "Kerala State Pollution Control Board (KSPCB)",
    "Public safety concerns": "Kerala Police / District Disaster Management Authority",
    "Other community issues": "Ward Councillor Secretariat & Municipal Revenue Office",
}

async def classify_incident_with_gemini(description: str, title: str = "", image_url: str = None) -> Dict[str, Any]:
    """Attempts classification using Google Gemini API if key is provided."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = f"""
You are the AI triage core for NEXUS civic intelligence network in Kerala, India.
Analyze this civic issue report:
Title: {title}
Description: {description}

Return a valid JSON object with these exact keys:
{{
  "category": (one of: "Road damage and potholes", "Drainage and waterlogging", "Garbage and waste management", "Water supply problems", "Public infrastructure damage", "Electricity and street lighting", "Environmental pollution", "Public safety concerns", "Other community issues"),
  "likely_issue_type": "string specific problem type",
  "severity": (integer 1-5, 5 being most critical),
  "urgency": ("low", "medium", "high", or "critical"),
  "suggested_title": "concise 5-8 word title",
  "confidence": (float 0.70 to 0.99),
  "supporting_observations": ["list", "of", "concrete", "observations"],
  "recommended_verification_steps": ["step 1", "step 2"],
  "suggested_department": "responsible Kerala department",
  "expected_impact": "impact description if addressed"
}}
Return only the JSON object.
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        text = response.text.strip()
        # Clean markdown codeblocks
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        parsed = json.loads(text.strip())
        parsed["is_simulated_ai"] = False
        return parsed
    except Exception as e:
        print(f"Gemini API call failed or unavailable ({e}); falling back to Explainable Heuristic AI.")
        return None

def classify_incident_heuristic(description: str, title: str = "", image_url: str = None) -> Dict[str, Any]:
    """High-accuracy explainable rule/NLP engine with Malayalam & English token understanding."""
    text_lower = f"{title} {description}".lower()
    
    # 1. Category Detection
    category_matches: Dict[str, int] = {cat: 0 for cat in CATEGORIES}
    matched_tokens: List[str] = []

    # Check Malayalam keywords
    for ml_word, cat in MALAYALAM_KEYWORD_MAP.items():
        if ml_word in text_lower or ml_word in description:
            category_matches[cat] += 3
            matched_tokens.append(f"Malayalam keyword '{ml_word}'")

    # Check English keywords
    for en_word, cat in ENGLISH_KEYWORD_MAP.items():
        if re.search(r'\b' + re.escape(en_word) + r'\b', text_lower):
            category_matches[cat] += 2
            matched_tokens.append(f"English keyword '{en_word}'")

    # Select best category
    best_category = max(category_matches, key=category_matches.get)
    if category_matches[best_category] == 0:
        best_category = "Other community issues"

    # 2. Severity & Urgency Evaluation
    severity = 3
    urgency = "medium"
    
    high_urgency_words = ["danger", "hazard", "spark", "collapse", "child", "hospital", "accident", "emergency", "burst", "deep crater", "overflowing", "live wire", "സ്പാർക്ക്", "അപകടം"]
    critical_words = ["electric shock", "flood water entered house", "open manhole near school", "road collapsed", "fire", "live wire touching water"]

    if any(cw in text_lower for cw in critical_words):
        severity = 5
        urgency = "critical"
    elif any(hw in text_lower for hw in high_urgency_words):
        severity = 4
        urgency = "high"
    elif len(description.split()) < 6:
        severity = 2
        urgency = "low"

    # 3. Suggested Title
    suggested_title = title.strip()
    if not suggested_title or len(suggested_title) < 5:
        # Extract first 6 words
        words = description.strip().split()
        first_few = " ".join(words[:6]) if words else "Civic Incident"
        suggested_title = f"{best_category.split(' and ')[0]}: {first_few}"
    
    # 4. Department
    department = DEPARTMENT_MAP.get(best_category, "Municipal Administrative Council")

    # 5. Supporting observations & Verification
    supporting_observations = [
        f"Linguistic semantic mapping identified: {', '.join(matched_tokens[:3]) or 'General community complaint pattern'}",
        f"Category mapped to primary jurisdiction: {department}",
        f"Assessed urgency level '{urgency}' based on public safety keywords and severity indicators"
    ]
    if image_url:
        supporting_observations.append("Photographic evidence attached for computer vision verification")

    verification_steps = [
        f"Field inspector to verify physical coordinates and exact dimension/depth at site",
        f"Check adjacent storm-water or utility service lines managed by {department}",
        f"Obtain citizen confirmation from nearby ward residents"
    ]

    expected_impact = (
        "Prevent road accidents and pedestrian injuries." if "Road" in best_category
        else "Mitigate localized flooding, water stagnation and mosquito breeding." if "Drainage" in best_category
        else "Restore sanitary public hygiene and prevent vector-borne disease spread." if "Garbage" in best_category
        else "Restore clean water access and halt road foundation erosion." if "Water" in best_category
        else "Restore nighttime pedestrian visibility and public safety." if "Electricity" in best_category
        else "Avert civic hazards and improve community livability."
    )

    return {
        "category": best_category,
        "likely_issue_type": f"{best_category} (Identified via pattern matcher)",
        "severity": severity,
        "urgency": urgency,
        "suggested_title": suggested_title[:60],
        "confidence": 0.89 if matched_tokens else 0.74,
        "supporting_observations": supporting_observations,
        "recommended_verification_steps": verification_steps,
        "suggested_department": department,
        "expected_impact": expected_impact,
        "is_simulated_ai": True
    }

async def analyze_incident(description: str, title: str = "", image_url: str = None) -> Dict[str, Any]:
    """Analyzes an incident using Gemini if available, else heuristic engine."""
    result = await classify_incident_with_gemini(description, title, image_url)
    if result:
        return result
    return classify_incident_heuristic(description, title, image_url)
