from typing import List, Dict, Any
from datetime import datetime
from services.weather_service import CURRENT_SCENARIO

def evaluate_locality_risks(incidents: List[Any], weather_data: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Evaluates community risks per locality based on open incidents,
    category vulnerability, and current/simulated weather indicators.
    """
    if not weather_data:
        weather_data = CURRENT_SCENARIO

    rainfall_mm = weather_data.get("rainfall_mm", 0.0)
    hazard_multiplier = weather_data.get("hazard_level", 0.2)
    weather_desc = weather_data.get("condition", "Standard Weather")

    # Group open incidents by locality
    locality_groups: Dict[str, List[Any]] = {}
    for inc in incidents:
        # Ignore closed/resolved/rejected
        if inc.status in ["resolved", "closed", "rejected"]:
            continue
        loc = inc.locality_name or "General Ward"
        if loc not in locality_groups:
            locality_groups[loc] = []
        locality_groups[loc].append(inc)

    assessments = []

    for loc_name, items in locality_groups.items():
        drainage_count = sum(1 for i in items if "drainage" in i.category.lower() or "waterlog" in i.category.lower())
        road_count = sum(1 for i in items if "road" in i.category.lower() or "pothole" in i.category.lower())
        electric_count = sum(1 for i in items if "electricity" in i.category.lower() or "wire" in i.category.lower())
        total_open = len(items)

        # Average coordinates for the locality
        avg_lat = sum(i.latitude for i in items) / total_open if total_open > 0 else 10.0
        avg_lon = sum(i.longitude for i in items) / total_open if total_open > 0 else 76.3

        # Base vulnerability score from incident concentration
        base_vuln = min(50.0, (drainage_count * 15.0) + (road_count * 10.0) + (electric_count * 12.0) + (total_open * 3.0))

        # Weather multiplier component
        weather_surge = (rainfall_mm / 100.0) * 45.0 if rainfall_mm > 0 else 0.0

        risk_score = min(98.0, base_vuln + weather_surge)

        # Determine level & dominant risk type
        if risk_score >= 75:
            risk_level = "severe"
            color = "rose"
        elif risk_score >= 55:
            risk_level = "high"
            color = "amber"
        elif risk_score >= 35:
            risk_level = "medium"
            color = "cyan"
        else:
            risk_level = "low"
            color = "blue"

        if drainage_count >= 2 and rainfall_mm >= 30:
            risk_type = "Flash Flood & Storm Drainage Backflow Hazard"
            recommended_action = "Deploy Municipal Emergency Dewatering Pumps; clear Periyar culvert grates and alert low-lying residential wards."
        elif road_count >= 3:
            risk_type = "Arterial Road Subsurface Erosion & Vehicle Hazard"
            recommended_action = "Immediate PWD cordon; deploy rapid cold-mix tar patching team and diversion signage."
        elif electric_count >= 1 and rainfall_mm > 20:
            risk_type = "Electrocution Hazard / Overhead Feeder Sag"
            recommended_action = "Notify KSEB Rapid Response Unit for urgent feeder de-energization and tree branch clearance."
        else:
            risk_type = "Compound Civic Strain & Public Health Risk"
            recommended_action = "Schedule joint inspection by Ward Sanitation and Engineering Overseer within 24 hours."

        evidence_items = [
            f"{total_open} active unresolved reports concentrated in {loc_name}",
            f"{drainage_count} drainage/waterlogging reports, {road_count} road damage reports",
            f"Precipitation level: {rainfall_mm} mm/hr ({weather_desc})",
            f"Model vulnerability factor: {round(base_vuln, 1)} pts + weather escalation: {round(weather_surge, 1)} pts"
        ]

        assessments.append({
            "locality_name": loc_name,
            "latitude": round(avg_lat, 6),
            "longitude": round(avg_lon, 6),
            "risk_type": risk_type,
            "risk_level": risk_level,
            "risk_score": round(risk_score, 1),
            "color": color,
            "rainfall_mm": round(rainfall_mm, 1),
            "related_incidents_count": total_open,
            "drainage_count": drainage_count,
            "road_count": road_count,
            "evidence_summary": "; ".join(evidence_items),
            "evidence_items": evidence_items,
            "recommended_action": recommended_action,
            "is_simulated": weather_data.get("is_simulated", True),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })

    # Sort descending by risk score
    assessments.sort(key=lambda x: x["risk_score"], reverse=True)
    return assessments
