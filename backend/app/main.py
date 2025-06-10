from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
import os
from datetime import datetime, timedelta
import jwt

from app.database import SessionLocal, engine, Base
from app.models import Species, Observation, User, Activity
from app.schemas import (
    SpeciesCreate, SpeciesResponse, 
    ObservationCreate, ObservationResponse,
    UserCreate, UserResponse, Token
)

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wildlife Tracker API",
    description="API pour le suivi des espèces dans les parcs nationaux",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

# Dépendance pour la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentification
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

@app.get("/")
async def root():
    return {"message": "Wildlife Tracker API - Système de suivi des espèces"}

# === ROUTES ESPÈCES ===

@app.post("/species", response_model=SpeciesResponse)
async def create_species(species: SpeciesCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle espèce"""
    db_species = Species(**species.dict())
    db.add(db_species)
    db.commit()
    db.refresh(db_species)
    return db_species

@app.get("/species", response_model=List[SpeciesResponse])
async def get_species(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lister toutes les espèces"""
    species = db.query(Species).offset(skip).limit(limit).all()
    return species

@app.get("/species/{species_id}", response_model=SpeciesResponse)
async def get_species_by_id(species_id: int, db: Session = Depends(get_db)):
    """Obtenir une espèce par ID"""
    species = db.query(Species).filter(Species.id == species_id).first()
    if not species:
        raise HTTPException(status_code=404, detail="Espèce non trouvée")
    return species

@app.put("/species/{species_id}", response_model=SpeciesResponse)
async def update_species(
    species_id: int, 
    species_update: SpeciesCreate, 
    db: Session = Depends(get_db)
):
    """Mettre à jour une espèce"""
    species = db.query(Species).filter(Species.id == species_id).first()
    if not species:
        raise HTTPException(status_code=404, detail="Espèce non trouvée")
    
    for key, value in species_update.dict().items():
        setattr(species, key, value)
    
    db.commit()
    db.refresh(species)
    return species

@app.delete("/species/{species_id}")
async def delete_species(species_id: int, db: Session = Depends(get_db)):
    """Supprimer une espèce"""
    species = db.query(Species).filter(Species.id == species_id).first()
    if not species:
        raise HTTPException(status_code=404, detail="Espèce non trouvée")
    
    db.delete(species)
    db.commit()
    return {"message": "Espèce supprimée avec succès"}

# === ROUTES OBSERVATIONS ===

@app.post("/observations", response_model=ObservationResponse)
async def create_observation(
    observation: ObservationCreate, 
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_token)
):
    """Créer une nouvelle observation"""
    db_observation = Observation(**observation.dict(), observer_id=user_id)
    db.add(db_observation)
    db.commit()
    db.refresh(db_observation)
    return db_observation

@app.get("/observations", response_model=List[ObservationResponse])
async def get_observations(
    species_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Lister les observations avec filtres optionnels"""
    query = db.query(Observation)
    
    if species_id:
        query = query.filter(Observation.species_id == species_id)
    
    observations = query.offset(skip).limit(limit).all()
    return observations

@app.get("/observations/geojson")
async def get_observations_geojson(
    species_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Obtenir les observations au format GeoJSON pour la cartographie"""
    query = db.query(Observation)
    
    if species_id:
        query = query.filter(Observation.species_id == species_id)
    
    observations = query.all()
    
    features = []
    for obs in observations:
        if obs.latitude and obs.longitude:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [obs.longitude, obs.latitude]
                },
                "properties": {
                    "id": obs.id,
                    "species_id": obs.species_id,
                    "species_name": obs.species.common_name if obs.species else "Inconnu",
                    "count": obs.count,
                    "activity_type": obs.activity_type,
                    "observation_date": obs.observation_date.isoformat() if obs.observation_date else None,
                    "notes": obs.notes
                }
            }
            features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

# === IMPORT EXCEL ===

@app.post("/species/import-excel")
async def import_species_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importer des espèces depuis un fichier Excel"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format de fichier non supporté")
    
    # Sauvegarder le fichier temporairement
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    try:
        # Lire le fichier Excel
        df = pd.read_excel(file_path)
        
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Adapter selon la structure de votre fichier Excel
                species_data = {
                    "common_name": row.get("nom_commun", ""),
                    "scientific_name": row.get("nom_scientifique", ""),
                    "category": row.get("categorie", "animal"),
                    "conservation_status": row.get("statut_conservation", "LC"),
                    "description": row.get("description", "")
                }
                
                # Vérifier si l'espèce existe déjà
                existing = db.query(Species).filter(
                    Species.scientific_name == species_data["scientific_name"]
                ).first()
                
                if not existing:
                    db_species = Species(**species_data)
                    db.add(db_species)
                    imported_count += 1
                
            except Exception as e:
                errors.append(f"Ligne {index + 1}: {str(e)}")
        
        db.commit()
        
        return {
            "message": f"{imported_count} espèces importées avec succès",
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import: {str(e)}")
    
    finally:
        # Nettoyer le fichier temporaire
        if os.path.exists(file_path):
            os.remove(file_path)

# === STATISTIQUES ===

@app.get("/stats/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Obtenir les statistiques pour le tableau de bord"""
    total_species = db.query(Species).count()
    total_observations = db.query(Observation).count()
    
    # Observations par espèce
    species_obs = db.query(
        Species.common_name,
        db.func.count(Observation.id).label('count')
    ).join(Observation).group_by(Species.id, Species.common_name).all()
    
    # Observations récentes (30 derniers jours)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_observations = db.query(Observation).filter(
        Observation.observation_date >= thirty_days_ago
    ).count()
    
    return {
        "total_species": total_species,
        "total_observations": total_observations,
        "recent_observations": recent_observations,
        "species_observations": [
            {"species": name, "count": count} for name, count in species_obs
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)