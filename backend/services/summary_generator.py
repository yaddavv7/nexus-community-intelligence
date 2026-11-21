from typing import List, Dict, Any
from datetime import datetime
from collections import Counter

def generate_community_summary(incidents: List[Any], risk_assessments: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Generates an executive AI civic intelligence briefing for administrators and citizens."""
    total = len(incidents)
    resolved = sum(1 for i in incidents if i.status in ["resolved", "closed"])
    pending = total - resolved
    verified = sum(1 for i in incidents if i.status in ["verified", "assigned", "in_progress"])
    high_priority = sum(1 for i in incidents if i.priority_score >= 65 and i.status not in ["resolved", "closed"])

    # Category counts
    cat_counter = Counter(i.category for i in incidents)
    top_categories = [{"category": cat, "count": count} for cat, count in cat_counter.most_common(4)]

    # Locality counts
    loc_counter = Counter(i.locality_name for i in incidents if i.status not in ["resolved", "closed"])
    hotspot_localities = [{"locality": loc, "active_count": count} for loc, count in loc_counter.most_common(3)]

    top_cat_name = top_categories[0]["category"] if top_categories else "General Infrastructure"
    top_loc_name = hotspot_localities[0]["locality"] if hotspot_localities else "Central Ward"

    summary_text = (
        f"NEXUS Intelligence briefing indicates {total} total recorded civic incidents across Kerala demonstration sectors. "
        f"Currently, {pending} incidents remain active, with {high_priority} classified under High or Critical priority. "
        f"The primary pressure point is '{top_cat_name}' ({top_categories[0]['count'] if top_categories else 0} reports), "
        f"with significant clustering in {top_loc_name}. "
        f"{resolved} community incidents have been verified as resolved, reflecting an active civic resolution pipeline."
    )

    action_priorities = [
        f"Authorize priority repair crews for {top_loc_name} to address clustered {top_cat_name.lower()} before precipitation surges.",
        f"Deploy field volunteers to inspect and confirm pending duplicate candidates to streamline field assignments.",
        f"Coordinate with Kerala Water Authority and PWD on interlocking utility excavation zones in commercial corridors."
    ]

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total_incidents": total,
        "active_incidents": pending,
        "resolved_incidents": resolved,
        "verified_in_pipeline": verified,
        "high_priority_count": high_priority,
        "top_categories": top_categories,
        "hotspot_localities": hotspot_localities,
        "executive_summary": summary_text,
        "recommended_priorities": action_priorities,
        "is_ai_generated": True
    }
