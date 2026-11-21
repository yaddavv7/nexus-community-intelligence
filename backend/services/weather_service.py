import httpx
from datetime import datetime
from typing import Dict, Any

# Current simulated scenario state (in-memory for demo / test runs)
CURRENT_SCENARIO = {
    "is_simulated": True,
    "scenario_name": "Monsoon Active Hazard",
    "rainfall_mm": 68.5,
    "temperature_c": 27.2,
    "condition": "Heavy Monsoon Precipitation & Thunderstorms",
    "wind_speed_kmh": 38.0,
    "humidity": 94,
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "hazard_level": 0.85 # 0.0 to 1.0 multiplier
}

async def fetch_live_weather(lat: float = 9.9816, lon: float = 76.2999) -> Dict[str, Any]:
    """
    Fetches real-time weather from Open-Meteo for Kerala (Kochi/Ernakulam).
    Zero API key required.
    """
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current", {})
                precip = current.get("precipitation", 0.0)
                temp = current.get("temperature_2m", 28.0)
                wind = current.get("wind_speed_10m", 12.0)
                humidity = current.get("relative_humidity_2m", 80)
                
                # Estimate hazard multiplier from precipitation
                hazard = min(1.0, precip / 50.0) if precip > 0 else 0.1

                return {
                    "is_simulated": False,
                    "scenario_name": "Live Kerala Observation (Open-Meteo)",
                    "rainfall_mm": round(precip, 1),
                    "temperature_c": round(temp, 1),
                    "condition": "Live Precipitation" if precip > 5 else "Clear/Overcast",
                    "wind_speed_kmh": round(wind, 1),
                    "humidity": humidity,
                    "timestamp": current.get("time", datetime.utcnow().isoformat()),
                    "hazard_level": round(hazard, 2),
                    "locality": "Kochi Metro Region, Kerala"
                }
    except Exception as e:
        print(f"Open-Meteo live query skipped ({e}), serving demo weather scenario.")
    
    return CURRENT_SCENARIO

def set_weather_scenario(scenario: str, rainfall_mm: float = None) -> Dict[str, Any]:
    """Sets a simulated weather scenario for demonstration testing."""
    global CURRENT_SCENARIO
    if scenario == "monsoon_heavy":
        CURRENT_SCENARIO = {
            "is_simulated": True,
            "scenario_name": "Active Southwest Monsoon Torrential Downpour",
            "rainfall_mm": rainfall_mm if rainfall_mm is not None else 84.0,
            "temperature_c": 25.4,
            "condition": "Severe Monsoon Torrential Rain / Red Alert Advisory",
            "wind_speed_kmh": 46.2,
            "humidity": 97,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "hazard_level": 0.95
        }
    elif scenario == "moderate_rain":
        CURRENT_SCENARIO = {
            "is_simulated": True,
            "scenario_name": "Seasonal Intermittent Showers",
            "rainfall_mm": rainfall_mm if rainfall_mm is not None else 28.0,
            "temperature_c": 28.1,
            "condition": "Passing Rain Showers & Overcast Sky",
            "wind_speed_kmh": 22.0,
            "humidity": 85,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "hazard_level": 0.45
        }
    else: # clear_sky
        CURRENT_SCENARIO = {
            "is_simulated": True,
            "scenario_name": "Clear Sky / Post-Monsoon Dry Interval",
            "rainfall_mm": rainfall_mm if rainfall_mm is not None else 0.0,
            "temperature_c": 31.8,
            "condition": "Fair Weather / Optimal Conditions",
            "wind_speed_kmh": 11.5,
            "humidity": 68,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "hazard_level": 0.05
        }
    return CURRENT_SCENARIO
