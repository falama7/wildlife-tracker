#!/bin/bash

# Script d'installation automatique de Wildlife Tracker
set -e

echo "🌿 Installation de Wildlife Tracker"
echo "===================================="

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Docker détecté"

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    
    # Générer une clé secrète aléatoire
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/your-super-secret-key-change-in-production-minimum-32-characters/$SECRET_KEY/" .env
    
    echo "✅ Fichier .env créé avec une clé secrète générée"
else
    echo "✅ Fichier .env existant"
fi

# Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p uploads backups logs

# Construire et démarrer les services
echo "🏗️ Construction des images Docker..."
docker-compose build --no-cache

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que la base soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# Initialiser la base de données
echo "🗄️ Initialisation de la base de données..."
docker-compose exec -T backend python -c "
from app.database import init_database
init_database()
print('Base de données initialisée avec succès!')
"

# Vérifier le statut des services
echo "🔍 Vérification des services..."
docker-compose ps

echo ""
echo "🎉 Installation terminée avec succès!"
echo ""
echo "📋 Informations d'accès:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8000"
echo "   Documentation API: http://localhost:8000/docs"
echo ""
echo "🔐 Compte administrateur par défaut:"
echo "   Utilisateur: admin"
echo "   Mot de passe: admin123"
echo ""
echo "⚠️  IMPORTANT: Changez le mot de passe administrateur au premier accès!"
echo ""
echo "📖 Pour plus d'informations, consultez le README.md"