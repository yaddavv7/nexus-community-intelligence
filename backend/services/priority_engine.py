from datetime import datetime
from typing import Dict, Any

URGENCY_SCORES = {
    "low": 25.0,
    "medium": 50.0,
    "high": 75.0,
    "critical": 100.0
}

def calculate_priority_score(
    severity: int,
    urgency: str,
    confirmations_count: int = 0,
    evidence_count: int = 0,
    created_at: datetime = None,
    category: str = "",
    weather_hazard_level: float = 0.0 # 0.0 to 1.0 (e.g. from rain)
) -> Dict[str, Any]:
    """
    Computes transparent multi-factor priority score from 0 to 100.
    Returns:
      priority_score: float
      breakdown: Dict of contributing factors & weights
    """
    # 1. Severity component (0 to 100) -> 20 pts per level
    sev_component = min(100.0, max(20.0, severity * 20.0))

    # 2. Urgency component (0 to 100)
    urg_component = URGENCY_SCORES.get(urgency.lower(), 50.0)

    # 3. Community Endorsement / Impact (0 to 100)
    # 1 confirmation = +10 pts, capped at 100
    comm_component = min(100.0, (confirmations_count * 12.0) + (evidence_count * 8.0) + 20.0)

    # 4. Time Elapsed / Stagnation penalty
    # If open for days without resolution, priority escalates
    days_elapsed = 0.0
    if created_at:
        now = datetime.utcnow()
        days_elapsed = max(0.0, (now - created_at).total_seconds() / 86400.0)
    time_component = min(100.0, 30.0 + (days_elapsed * 10.0))

    # 5. Environmental hazard multiplier (e.g. rain + drainage)
    hazard_multiplier = 0.0
    if "drainage" in category.lower() or "road" in category.lower():
        hazard_multiplier = weather_hazard_level * 100.0
    else:
        hazard_multiplier = weather_hazard_level * 40.0

    # Weighted sum formula:
    # Severity: 25%
    # Urgency: 25%
    # Community Confirmations: 20%
    # Time Decay / Stagnation: 15%
    # Weather Risk Amplifier: 15%
    final_score = (
        (sev_component * 0.25) +
        (urg_component * 0.25) +
        (comm_component * 0.20) +
        (time_component * 0.15) +
        (hazard_multiplier * 0.15)
    )
    final_score = min(99.0, max(15.0, final_score))

    # Determine priority tier
    if final_score >= 80:
        tier = "Critical"
        color = "rose"
    elif final_score >= 65:
        tier = "High"
        color = "amber"
    elif final_score >= 45:
        tier = "Medium"
        color = "cyan"
    else:
        tier = "Low"
        color = "blue"

    return {
        "priority_score": round(final_score, 1),
        "tier": tier,
        "color": color,
        "contributing_factors": {
            "severity_weight": 25,
            "severity_value": round(sev_component, 1),
            "urgency_weight": 25,
            "urgency_value": round(urg_component, 1),
            "community_support_weight": 20,
            "community_support_value": round(comm_component, 1),
            "time_elapsed_weight": 15,
            "time_elapsed_value": round(time_component, 1),
            "environmental_hazard_weight": 15,
            "environmental_hazard_value": round(hazard_multiplier, 1),
        },
        "explanation": f"Score {round(final_score, 1)} reflects {tier.lower()} priority: Severity level {severity}/5, {urgency} urgency, {confirmations_count} citizen confirmations, and environmental factor {round(hazard_multiplier, 1)}%."
    }
