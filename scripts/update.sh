#!/bin/bash

# Script de mise à jour

echo "🔄 Mise à jour de Wildlife Tracker"
echo "=================================="

# Sauvegarder avant mise à jour
echo "💾 Sauvegarde automatique avant mise à jour..."
./scripts/backup.sh

# Récupérer les dernières modifications
echo "📥 Récupération des mises à jour..."
git pull origin main

# Reconstruire les images
echo "🏗️ Reconstruction des images..."
docker-compose build --no-cache

# Redémarrer les services
echo "🔄 Redémarrage des services..."
docker-compose down
docker-compose up -d

# Appliquer les migrations
echo "🗄️ Application des migrations..."
docker-compose exec backend alembic upgrade head

echo "✅ Mise à jour terminée!"