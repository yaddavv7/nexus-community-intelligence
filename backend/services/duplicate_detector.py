import math
import re
from typing import List, Dict, Any

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS points in meters."""
    R = 6371000  # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def tokenize(text: str) -> set:
    """Tokenize and remove common stop words."""
    stopwords = {"the", "a", "an", "is", "in", "at", "of", "on", "and", "to", "near", "with", "for", "by", "from", "road", "area"}
    words = re.findall(r'\b\w+\b', text.lower())
    return {w for w in words if w not in stopwords and len(w) > 2}

def text_jaccard_similarity(text1: str, text2: str) -> float:
    """Computes Jaccard word-set similarity."""
    set1 = tokenize(text1)
    set2 = tokenize(text2)
    if not set1 or not set2:
        return 0.0
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union > 0 else 0.0

def evaluate_duplicate_pair(inc1: Any, inc2: Any) -> Dict[str, Any]:
    """
    Evaluates whether inc2 is a duplicate of inc1.
    Returns:
      is_candidate: bool
      similarity_score: float (0 to 1)
      distance_meters: float
      reason: str
    """
    dist_m = haversine_distance_meters(inc1.latitude, inc1.longitude, inc2.latitude, inc2.longitude)
    
    # Same category?
    cat_match = 1.0 if inc1.category.lower() == inc2.category.lower() else 0.2

    # Text similarity
    text_sim = text_jaccard_similarity(
        f"{inc1.title} {inc1.description}",
        f"{inc2.title} {inc2.description}"
    )

    # Proximity score (1.0 at 0m, 0.0 at 500m+)
    proximity_score = max(0.0, 1.0 - (dist_m / 450.0))

    # Composite similarity score
    composite_score = (proximity_score * 0.45) + (text_sim * 0.35) + (cat_match * 0.20)

    is_candidate = (dist_m <= 400 and composite_score >= 0.50) or (dist_m <= 150 and cat_match == 1.0)

    reasons = []
    if dist_m <= 100:
        reasons.append(f"Immediate vicinity ({int(dist_m)}m apart)")
    elif dist_m <= 400:
        reasons.append(f"Nearby geographical proximity ({int(dist_m)}m)")
    
    if cat_match == 1.0:
        reasons.append(f"Identical civic category ({inc1.category})")
    
    if text_sim >= 0.3:
        reasons.append(f"High semantic description overlap ({int(text_sim * 100)}%)")
    elif text_sim >= 0.15:
        reasons.append(f"Moderate description similarity ({int(text_sim * 100)}%)")

    reason_str = "; ".join(reasons) if reasons else f"Distance: {int(dist_m)}m, Composite match: {int(composite_score * 100)}%"

    return {
        "is_candidate": is_candidate,
        "similarity_score": round(composite_score, 2),
        "distance_meters": round(dist_m, 1),
        "reason": reason_str
    }
