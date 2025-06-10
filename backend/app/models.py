from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class SpeciesCategory(enum.Enum):
    ANIMAL = "animal"
    PLANT = "plant"

class ConservationStatus(enum.Enum):
    LC = "LC"  # Least Concern
    NT = "NT"  # Near Threatened
    VU = "VU"  # Vulnerable
    EN = "EN"  # Endangered
    CR = "CR"  # Critically Endangered
    EW = "EW"  # Extinct in the Wild
    EX = "EX"  # Extinct

class ActivityType(enum.Enum):
    POPULATION_MONITORING = "suivi_populations"
    ANTI_POACHING = "lutte_braconnage"
    HABITAT_MANAGEMENT = "gestion_habitat"
    COMMUNITY_ENGAGEMENT = "implication_communautes"
    RESTORATION = "restauration"
    RESEARCH = "recherche"

class UserRole(enum.Enum):
    ADMIN = "admin"
    RANGER = "ranger"
    ANALYST = "analyst"
    VIEWER = "viewer"

class Species(Base):
    __tablename__ = "species"
    
    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String(255), nullable=False)
    scientific_name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(Enum(SpeciesCategory), default=SpeciesCategory.ANIMAL)
    conservation_status = Column(Enum(ConservationStatus), default=ConservationStatus.LC)
    description = Column(Text)
    habitat_description = Column(Text)
    threats = Column(Text)
    conservation_actions = Column(Text)
    population_estimate = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    observations = relationship("Observation", back_populates="species")
    activities = relationship("Activity", back_populates="species")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relations
    observations = relationship("Observation", back_populates="observer")
    activities = relationship("Activity", back_populates="assigned_user")

class Observation(Base):
    __tablename__ = "observations"
    
    id = Column(Integer, primary_key=True, index=True)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=False)
    observer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Données géospatiales
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float)  # Précision GPS en mètres
    
    # Données d'observation
    observation_date = Column(DateTime, nullable=False)
    count = Column(Integer, default=1)
    activity_type = Column(Enum(ActivityType))
    
    # Détails environnementaux
    weather_conditions = Column(String(255))
    temperature = Column(Float)
    humidity = Column(Float)
    
    # Informations comportementales
    behavior_notes = Column(Text)
    health_status = Column(String(100))
    age_group = Column(String(50))  # adult, juvenile, infant
    sex = Column(String(10))  # male, female, unknown
    
    # Métadonnées
    notes = Column(Text)
    photo_urls = Column(Text)  # URLs séparées par des virgules
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    species = relationship("Species", back_populates="observations")
    observer = relationship("User", back_populates="observations")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=False)
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    
    # Détails de l'activité
    activity_type = Column(Enum(ActivityType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Planification
    planned_start_date = Column(DateTime)
    planned_end_date = Column(DateTime)
    actual_start_date = Column(DateTime)
    actual_end_date = Column(DateTime)
    
    # Status et priorité
    status = Column(String(50), default="planned")  # planned, in_progress, completed, cancelled
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Géolocalisation de l'activité
    latitude = Column(Float)
    longitude = Column(Float)
    area_covered = Column(Float)  # en km²
    
    # Résultats et métriques
    success_indicators = Column(Text)
    challenges_faced = Column(Text)
    recommendations = Column(Text)
    budget_allocated = Column(Float)
    budget_spent = Column(Float)
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    species = relationship("Species", back_populates="activities")
    assigned_user = relationship("User", back_populates="activities")

class WaterPoint(Base):
    __tablename__ = "water_points"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    
    # Géolocalisation
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Caractéristiques
    water_type = Column(String(50))  # river, lake, artificial, spring
    status = Column(String(50), default="active")  # active, dry, contaminated, under_maintenance
    capacity = Column(Float)  # en litres
    depth = Column(Float)  # en mètres
    
    # Qualité de l'eau
    ph_level = Column(Float)
    conductivity = Column(Float)
    last_quality_check = Column(DateTime)
    
    # Maintenance
    installation_date = Column(DateTime)
    last_maintenance = Column(DateTime)
    maintenance_frequency = Column(Integer)  # en jours
    
    # Utilisation
    species_usage = Column(Text)  # Liste des espèces qui utilisent ce point d'eau
    human_usage = Column(Boolean, default=False)
    
    # Métadonnées
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PatrolRoute(Base):
    __tablename__ = "patrol_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Géométrie de la route (stockée comme GeoJSON en texte)
    route_geometry = Column(Text)  # GeoJSON LineString
    
    # Caractéristiques
    total_distance = Column(Float)  # en kilomètres
    estimated_duration = Column(Integer)  # en minutes
    difficulty_level = Column(String(20), default="medium")  # easy, medium, hard
    
    # Planification
    frequency = Column(String(50))  # daily, weekly, monthly, irregular
    patrol_type = Column(String(50))  # anti_poaching, monitoring, maintenance
    
    # Points d'intérêt sur la route
    checkpoints = Column(Text)  # JSON avec les points de contrôle
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PatrolLog(Base):
    __tablename__ = "patrol_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("patrol_routes.id"))
    ranger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Détails de la patrouille
    patrol_date = Column(DateTime, nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    
    # Résultats
    incidents_reported = Column(Integer, default=0)
    wildlife_sightings = Column(Integer, default=0)
    illegal_activities = Column(Text)
    equipment_status = Column(Text)
    
    # Conditions
    weather_conditions = Column(String(255))
    visibility = Column(String(50))
    terrain_conditions = Column(String(255))
    
    # Rapport
    summary = Column(Text)
    recommendations = Column(Text)
    photos = Column(Text)  # URLs des photos
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    route = relationship("PatrolRoute")
    ranger = relationship("User")