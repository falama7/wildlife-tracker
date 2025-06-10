# backend/app/schemas.py
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums pour validation
class SpeciesCategoryEnum(str, Enum):
    animal = "animal"
    plant = "plant"

class ConservationStatusEnum(str, Enum):
    LC = "LC"
    NT = "NT"
    VU = "VU"
    EN = "EN"
    CR = "CR"
    EW = "EW"
    EX = "EX"

class ActivityTypeEnum(str, Enum):
    suivi_populations = "suivi_populations"
    lutte_braconnage = "lutte_braconnage"
    gestion_habitat = "gestion_habitat"
    implication_communautes = "implication_communautes"
    restauration = "restauration"
    recherche = "recherche"

class UserRoleEnum(str, Enum):
    admin = "admin"
    ranger = "ranger"
    analyst = "analyst"
    viewer = "viewer"

# === SCHÉMAS ESPÈCES ===

class SpeciesBase(BaseModel):
    common_name: str
    scientific_name: str
    category: SpeciesCategoryEnum = SpeciesCategoryEnum.animal
    conservation_status: ConservationStatusEnum = ConservationStatusEnum.LC
    description: Optional[str] = None
    habitat_description: Optional[str] = None
    threats: Optional[str] = None
    conservation_actions: Optional[str] = None
    population_estimate: Optional[int] = None

class SpeciesCreate(SpeciesBase):
    pass

class SpeciesUpdate(BaseModel):
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: Optional[SpeciesCategoryEnum] = None
    conservation_status: Optional[ConservationStatusEnum] = None
    description: Optional[str] = None
    habitat_description: Optional[str] = None
    threats: Optional[str] = None
    conservation_actions: Optional[str] = None
    population_estimate: Optional[int] = None

class SpeciesResponse(SpeciesBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# === SCHÉMAS UTILISATEURS ===

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    role: UserRoleEnum = UserRoleEnum.viewer

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRoleEnum] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# === SCHÉMAS OBSERVATIONS ===

class ObservationBase(BaseModel):
    species_id: int
    latitude: float
    longitude: float
    observation_date: datetime
    count: int = 1
    activity_type: Optional[ActivityTypeEnum] = None
    accuracy: Optional[float] = None
    weather_conditions: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    behavior_notes: Optional[str] = None
    health_status: Optional[str] = None
    age_group: Optional[str] = None
    sex: Optional[str] = None
    notes: Optional[str] = None
    photo_urls: Optional[str] = None

    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('La latitude doit être entre -90 et 90')
        return v

    @validator('longitude')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('La longitude doit être entre -180 et 180')
        return v

    @validator('count')
    def validate_count(cls, v):
        if v < 0:
            raise ValueError('Le nombre d\'individus ne peut pas être négatif')
        return v

class ObservationCreate(ObservationBase):
    pass

class ObservationUpdate(BaseModel):
    species_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    observation_date: Optional[datetime] = None
    count: Optional[int] = None
    activity_type: Optional[ActivityTypeEnum] = None
    accuracy: Optional[float] = None
    weather_conditions: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    behavior_notes: Optional[str] = None
    health_status: Optional[str] = None
    age_group: Optional[str] = None
    sex: Optional[str] = None
    notes: Optional[str] = None
    photo_urls: Optional[str] = None
    verified: Optional[bool] = None

class ObservationResponse(ObservationBase):
    id: int
    observer_id: int
    verified: bool
    created_at: datetime
    updated_at: datetime
    species: Optional[SpeciesResponse] = None
    observer: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# === SCHÉMAS ACTIVITÉS ===

class ActivityBase(BaseModel):
    species_id: int
    activity_type: ActivityTypeEnum
    title: str
    description: Optional[str] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_covered: Optional[float] = None
    budget_allocated: Optional[float] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    species_id: Optional[int] = None
    assigned_user_id: Optional[int] = None
    activity_type: Optional[ActivityTypeEnum] = None
    title: Optional[str] = None
    description: Optional[str] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_covered: Optional[float] = None
    success_indicators: Optional[str] = None
    challenges_faced: Optional[str] = None
    recommendations: Optional[str] = None
    budget_allocated: Optional[float] = None
    budget_spent: Optional[float] = None

class ActivityResponse(ActivityBase):
    id: int
    assigned_user_id: Optional[int] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    status: str
    priority: str
    success_indicators: Optional[str] = None
    challenges_faced: Optional[str] = None
    recommendations: Optional[str] = None
    budget_spent: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    species: Optional[SpeciesResponse] = None
    assigned_user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# === SCHÉMAS POINTS D'EAU ===

class WaterPointBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    water_type: Optional[str] = None
    status: str = "active"
    capacity: Optional[float] = None
    depth: Optional[float] = None
    notes: Optional[str] = None

class WaterPointCreate(WaterPointBase):
    pass

class WaterPointUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_type: Optional[str] = None
    status: Optional[str] = None
    capacity: Optional[float] = None
    depth: Optional[float] = None
    ph_level: Optional[float] = None
    conductivity: Optional[float] = None
    last_quality_check: Optional[datetime] = None
    last_maintenance: Optional[datetime] = None
    maintenance_frequency: Optional[int] = None
    species_usage: Optional[str] = None
    human_usage: Optional[bool] = None
    notes: Optional[str] = None

class WaterPointResponse(WaterPointBase):
    id: int
    ph_level: Optional[float] = None
    conductivity: Optional[float] = None
    last_quality_check: Optional[datetime] = None
    installation_date: Optional[datetime] = None
    last_maintenance: Optional[datetime] = None
    maintenance_frequency: Optional[int] = None
    species_usage: Optional[str] = None
    human_usage: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# === SCHÉMAS PATROUILLES ===

class PatrolRouteBase(BaseModel):
    name: str
    description: Optional[str] = None
    route_geometry: Optional[str] = None
    total_distance: Optional[float] = None
    estimated_duration: Optional[int] = None
    difficulty_level: str = "medium"
    frequency: Optional[str] = None
    patrol_type: Optional[str] = None

class PatrolRouteCreate(PatrolRouteBase):
    pass

class PatrolRouteResponse(PatrolRouteBase):
    id: int
    checkpoints: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PatrolLogBase(BaseModel):
    route_id: Optional[int] = None
    patrol_date: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    incidents_reported: int = 0
    wildlife_sightings: int = 0
    illegal_activities: Optional[str] = None
    weather_conditions: Optional[str] = None
    summary: Optional[str] = None

class PatrolLogCreate(PatrolLogBase):
    pass

class PatrolLogResponse(PatrolLogBase):
    id: int
    ranger_id: int
    equipment_status: Optional[str] = None
    visibility: Optional[str] = None
    terrain_conditions: Optional[str] = None
    recommendations: Optional[str] = None
    photos: Optional[str] = None
    created_at: datetime
    route: Optional[PatrolRouteResponse] = None
    ranger: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# === SCHÉMAS STATISTIQUES ===

class DashboardStats(BaseModel):
    total_species: int
    total_observations: int
    recent_observations: int
    species_observations: List[dict]

class SpeciesStatistics(BaseModel):
    species_id: int
    species_name: str
    total_observations: int
    last_observation_date: Optional[datetime] = None
    population_trend: Optional[str] = None
    threat_level: Optional[str] = None

# === SCHÉMAS D'IMPORT ===

class ImportResult(BaseModel):
    success: bool
    imported_count: int
    errors: List[str]
    message: str