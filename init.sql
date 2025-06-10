-- Activer l'extension PostGIS pour les données géospatiales
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Créer les types énumérés
DO $$ 
BEGIN
    -- Vérifier et créer les types s'ils n'existent pas
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'species_category') THEN
        CREATE TYPE species_category AS ENUM ('animal', 'plant');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conservation_status') THEN
        CREATE TYPE conservation_status AS ENUM ('LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE activity_type AS ENUM (
            'suivi_populations', 
            'lutte_braconnage', 
            'gestion_habitat', 
            'implication_communautes', 
            'restauration', 
            'recherche'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'ranger', 'analyst', 'viewer');
    END IF;
END $$;

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer les index géospatiaux après la création des tables
DO $$
BEGIN
    -- Index pour la table observations (sera créé après la table)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'observations') THEN
        CREATE INDEX IF NOT EXISTS idx_observations_location ON observations USING GIST (ST_MakePoint(longitude, latitude));
        CREATE INDEX IF NOT EXISTS idx_observations_species_date ON observations (species_id, observation_date);
        CREATE INDEX IF NOT EXISTS idx_observations_date ON observations (observation_date);
    END IF;
    
    -- Index pour la table water_points (sera créé après la table)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'water_points') THEN
        CREATE INDEX IF NOT EXISTS idx_water_points_location ON water_points USING GIST (ST_MakePoint(longitude, latitude));
    END IF;
    
    -- Index pour la table activities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') THEN
        CREATE INDEX IF NOT EXISTS idx_activities_species ON activities (species_id);
        CREATE INDEX IF NOT EXISTS idx_activities_date ON activities (planned_start_date);
        CREATE INDEX IF NOT EXISTS idx_activities_status ON activities (status);
    END IF;
    
    -- Index pour les utilisateurs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
        CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active);
    END IF;
    
    -- Index pour les espèces
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'species') THEN
        CREATE INDEX IF NOT EXISTS idx_species_category ON species (category);
        CREATE INDEX IF NOT EXISTS idx_species_status ON species (conservation_status);
        CREATE INDEX IF NOT EXISTS idx_species_scientific_name ON species (scientific_name);
    END IF;
END $$;

-- Vues utiles pour les analyses

-- Vue des statistiques par espèce
CREATE OR REPLACE VIEW species_statistics AS
SELECT 
    s.id,
    s.common_name,
    s.scientific_name,
    s.conservation_status,
    s.category,
    COUNT(o.id) as total_observations,
    MAX(o.observation_date) as last_observation_date,
    AVG(o.count) as average_count_per_observation,
    SUM(o.count) as total_individuals_observed,
    COUNT(DISTINCT o.observer_id) as number_of_observers
FROM species s
LEFT JOIN observations o ON s.id = o.species_id
GROUP BY s.id, s.common_name, s.scientific_name, s.conservation_status, s.category;

-- Vue des observations récentes (30 derniers jours)
CREATE OR REPLACE VIEW recent_observations AS
SELECT 
    o.*,
    s.common_name as species_name,
    s.conservation_status,
    u.username as observer_name,
    u.full_name as observer_full_name
FROM observations o
JOIN species s ON o.species_id = s.id
JOIN users u ON o.observer_id = u.id
WHERE o.observation_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY o.observation_date DESC;

-- Vue des activités en cours
CREATE OR REPLACE VIEW active_activities AS
SELECT 
    a.*,
    s.common_name as species_name,
    u.username as assigned_to,
    u.full_name as assigned_to_full_name
FROM activities a
JOIN species s ON a.species_id = s.id
LEFT JOIN users u ON a.assigned_user_id = u.id
WHERE a.status IN ('planned', 'in_progress')
ORDER BY a.planned_start_date;

-- Fonction pour calculer la densité d'observations dans une zone
CREATE OR REPLACE FUNCTION observation_density_in_area(
    center_lat FLOAT,
    center_lng FLOAT,
    radius_km FLOAT DEFAULT 10.0
) RETURNS TABLE (
    species_id INTEGER,
    species_name TEXT,
    observation_count BIGINT,
    density_per_km2 FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.common_name,
        COUNT(o.id)::BIGINT,
        (COUNT(o.id)::FLOAT / (PI() * (radius_km * radius_km))) as density
    FROM species s
    LEFT JOIN observations o ON s.id = o.species_id
    WHERE ST_DWithin(
        ST_MakePoint(center_lng, center_lat)::geography,
        ST_MakePoint(o.longitude, o.latitude)::geography,
        radius_km * 1000  -- Convertir km en mètres
    )
    GROUP BY s.id, s.common_name
    HAVING COUNT(o.id) > 0
    ORDER BY COUNT(o.id) DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour identifier les zones de forte activité de braconnage
CREATE OR REPLACE FUNCTION poaching_hotspots(
    days_back INTEGER DEFAULT 90,
    min_incidents INTEGER DEFAULT 2
) RETURNS TABLE (
    area_center GEOMETRY,
    incident_count BIGINT,
    species_affected TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ST_Centroid(ST_Collect(ST_MakePoint(o.longitude, o.latitude))) as center,
        COUNT(o.id)::BIGINT,
        array_agg(DISTINCT s.common_name) as species_list
    FROM observations o
    JOIN species s ON o.species_id = s.id
    WHERE o.activity_type = 'lutte_braconnage'
    AND o.observation_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY ST_SnapToGrid(ST_MakePoint(o.longitude, o.latitude), 0.01)  -- Grouper par grille ~1km
    HAVING COUNT(o.id) >= min_incidents
    ORDER BY COUNT(o.id) DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour validation des coordonnées GPS
CREATE OR REPLACE FUNCTION validate_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier la latitude
    IF NEW.latitude < -90 OR NEW.latitude > 90 THEN
        RAISE EXCEPTION 'Latitude invalide: % (doit être entre -90 et 90)', NEW.latitude;
    END IF;
    
    -- Vérifier la longitude
    IF NEW.longitude < -180 OR NEW.longitude > 180 THEN
        RAISE EXCEPTION 'Longitude invalide: % (doit être entre -180 et 180)', NEW.longitude;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Messages d'information
DO $$
BEGIN
    RAISE NOTICE 'Base de données Wildlife Tracker initialisée avec succès!';
    RAISE NOTICE 'Extensions PostGIS activées';
    RAISE NOTICE 'Types énumérés créés';
    RAISE NOTICE 'Vues d''analyse créées';
    RAISE NOTICE 'Fonctions utilitaires créées';
END $$;