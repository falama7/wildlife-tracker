from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# URL de connexion à la base de données
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://wildlife_user:wildlife_password@localhost:5432/wildlife_tracker"
)

# Création du moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Pour debug - à désactiver en production
    pool_size=20,
    max_overflow=0
)

# Configuration de la session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()

# Fonction utilitaire pour obtenir une session DB
def get_database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Script d'initialisation de la base de données
def init_database():
    """Initialise la base de données avec des données de base"""
    from app.models import Base, Species, User, SpeciesCategory, ConservationStatus, UserRole
    from sqlalchemy.orm import Session
    import bcrypt
    
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Vérifier si des espèces existent déjà
        existing_species = db.query(Species).first()
        if not existing_species:
            # Données d'espèces basées sur votre document
            initial_species = [
                {
                    "common_name": "Lion",
                    "scientific_name": "Panthera leo leo",
                    "category": SpeciesCategory.ANIMAL,
                    "conservation_status": ConservationStatus.VU,
                    "description": "Le roi des animaux, prédateur apex des savanes africaines",
                    "habitat_description": "Savanes, prairies et zones boisées ouvertes",
                    "threats": "Braconnage, conflit homme-animal, perte d'habitat",
                    "conservation_actions": "Suivi des populations, patrouilles anti-braconnage, gestion des conflits"
                },
                {
                    "common_name": "Girafe du Kordofan",
                    "scientific_name": "Giraffa camelopardalis antiquorum",
                    "category": SpeciesCategory.ANIMAL,
                    "conservation_status": ConservationStatus.CR,
                    "description": "Sous-espèce de girafe particulièrement menacée",
                    "habitat_description": "Savanes arborées et zones semi-arides",
                    "threats": "Braconnage, fragmentation de l'habitat, sécheresse",
                    "conservation_actions": "Protection des corridors de migration, gestion des points d'eau"
                },
                {
                    "common_name": "Éléphant de savane",
                    "scientific_name": "Loxodonta africana",
                    "category": SpeciesCategory.ANIMAL,
                    "conservation_status": ConservationStatus.EN,
                    "description": "Plus grand mammifère terrestre, ingénieur de l'écosystème",
                    "habitat_description": "Savanes, forêts claires et zones humides",
                    "threats": "Braconnage pour l'ivoire, conflit homme-éléphant",
                    "conservation_actions": "Surveillance satellite, protection des corridors"
                },
                {
                    "common_name": "Eland de Derby",
                    "scientific_name": "Taurotragus derbianus",
                    "category": SpeciesCategory.ANIMAL,
                    "conservation_status": ConservationStatus.CR,
                    "description": "Plus grande antilope d'Afrique, espèce emblématique",
                    "habitat_description": "Savanes boisées et zones de transition",
                    "threats": "Chasse excessive, perte d'habitat",
                    "conservation_actions": "Programmes de reproduction, protection des habitats"
                },
                {
                    "common_name": "Hippopotame",
                    "scientific_name": "Hippopotamus amphibius",
                    "category": SpeciesCategory.ANIMAL,
                    "conservation_status": ConservationStatus.VU,
                    "description": "Mammifère semi-aquatique, indicateur de la santé des écosystèmes aquatiques",
                    "habitat_description": "Rivières, lacs et zones humides",
                    "threats": "Pollution de l'eau, orpaillage, chasse",
                    "conservation_actions": "Protection des cours d'eau, lutte contre l'orpaillage"
                },
                {
                    "common_name": "Autruche d'Afrique",
                    "scientific_name": "Struthio camelus",
                    "category": SpeciesCategory.ANIMAL,
                    "conservation_status": ConservationStatus.LC,
                    "description": "Plus grand oiseau du monde, adapté aux milieux arides",
                    "habitat_description": "Savanes ouvertes et zones semi-arides",
                    "threats": "Collecte des œufs, dégradation de l'habitat",
                    "conservation_actions": "Protection des sites de nidification"
                },
                {
                    "common_name": "Crocodile du Nil",
                    "scientific_name": "Crocodylus niloticus",
                    "category": SpeciesCategory.ANIMAL,
                    "conservation_status": ConservationStatus.LC,
                    "description": "Prédateur apex des écosystèmes aquatiques africains",
                    "habitat_description": "Rivières, lacs et marécages",
                    "threats": "Pollution, destruction des habitats aquatiques",
                    "conservation_actions": "Création de refuges aquatiques"
                },
                {
                    "common_name": "Acadjou d'Afrique",
                    "scientific_name": "Afzelia africana",
                    "category": SpeciesCategory.PLANT,
                    "conservation_status": ConservationStatus.VU,
                    "description": "Arbre précieux des forêts sèches africaines",
                    "habitat_description": "Forêts sèches et savanes boisées",
                    "threats": "Exploitation forestière illégale, feux de brousse",
                    "conservation_actions": "Régénération assistée, lutte contre les feux"
                },
                {
                    "common_name": "Dattier du désert",
                    "scientific_name": "Balanites aegyptiaca",
                    "category": SpeciesCategory.PLANT,
                    "conservation_status": ConservationStatus.LC,
                    "description": "Arbre multifonctionnel des zones arides",
                    "habitat_description": "Zones semi-arides et savanes",
                    "threats": "Surexploitation, sécheresse",
                    "conservation_actions": "Gestion durable, sensibilisation communautaire"
                },
                {
                    "common_name": "Acacia rouge",
                    "scientific_name": "Acacia seyal",
                    "category": SpeciesCategory.PLANT,
                    "conservation_status": ConservationStatus.LC,
                    "description": "Arbre pionnier important pour la restauration",
                    "habitat_description": "Zones inondables et sols argileux",
                    "threats": "Feux de brousse, surpâturage",
                    "conservation_actions": "Régénération naturelle assistée"
                }
            ]
            
            for species_data in initial_species:
                species = Species(**species_data)
                db.add(species)
            
            print("✅ Espèces initiales créées")
        
        # Créer un utilisateur administrateur par défaut
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if not existing_admin:
            password = "admin123"
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            admin_user = User(
                username="admin",
                email="admin@wildlifetracker.com",
                hashed_password=hashed_password.decode('utf-8'),
                full_name="Administrateur Système",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            print("✅ Utilisateur admin créé (username: admin, password: admin123)")
        
        db.commit()
        print("✅ Base de données initialisée avec succès")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()