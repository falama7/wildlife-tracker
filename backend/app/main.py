from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Wildlife Tracker API",
    description="API pour le suivi des espèces dans les parcs nationaux",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Wildlife Tracker API - Système de suivi des espèces"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/stats/dashboard")
async def get_dashboard_stats():
    return {
        "total_species": 10,
        "total_observations": 0,
        "recent_observations": 0,
        "species_observations": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
