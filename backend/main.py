from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from seed_data import seed_database
from config import settings

from routers.auth import router as auth_router
from routers.incidents import router as incidents_router
from routers.ai import router as ai_router
from routers.weather import router as weather_router
from routers.analytics import router as analytics_router
from routers.demo import router as demo_router
from routers.notifications import router as notifications_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed demonstration data if needed
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title="NEXUS Civic Intelligence API",
    description="Backend API for AI-Powered Community Intelligence & Predictive Problem Management Network",
    version=settings.VERSION
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(incidents_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(weather_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(demo_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "system": "NEXUS Core Intelligence Network",
        "tagline": "Detect Problems. Connect Communities. Predict Risks. Create Impact.",
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_engine": "operational",
        "weather_service": "active",
        "demo_mode": settings.DEMO_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
