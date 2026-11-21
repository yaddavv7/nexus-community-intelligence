from fastapi import APIRouter
from services.weather_service import fetch_live_weather, set_weather_scenario, CURRENT_SCENARIO
from schemas import WeatherScenarioRequest

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/current")
async def get_current_weather(live: bool = False):
    if live:
        data = await fetch_live_weather()
        return data
    return CURRENT_SCENARIO

@router.post("/scenario")
def change_weather_scenario(req: WeatherScenarioRequest):
    updated = set_weather_scenario(req.scenario, req.rainfall_mm)
    return {
        "message": f"Simulated weather set to '{req.scenario}'",
        "weather": updated
    }
