#!/bin/bash

# Script de sauvegarde automatique
set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wildlife_tracker_backup_$DATE"

echo "💾 Sauvegarde de Wildlife Tracker - $DATE"
echo "=========================================="

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

echo "🗄️ Sauvegarde de la base de données..."
docker-compose exec -T db pg_dump -U wildlife_user -c wildlife_tracker | gzip > "$BACKUP_DIR/${BACKUP_FILE}_database.sql.gz"

echo "📁 Sauvegarde des fichiers uploadés..."
tar -czf "$BACKUP_DIR/${BACKUP_FILE}_uploads.tar.gz" uploads/ 2>/dev/null || echo "Aucun fichier à sauvegarder"

echo "⚙️ Sauvegarde de la configuration..."
cp .env "$BACKUP_DIR/${BACKUP_FILE}_config.env" 2>/dev/null || echo "Pas de fichier .env"
cp docker-compose.yml "$BACKUP_DIR/${BACKUP_FILE}_docker-compose.yml"

# Nettoyer les anciennes sauvegardes (garder 30 jours)
echo "🧹 Nettoyage des anciennes sauvegardes..."
find $BACKUP_DIR -name "wildlife_tracker_backup_*" -type f -mtime +30 -delete || true

echo "✅ Sauvegarde terminée: $BACKUP_FILE"
echo "📍 Emplacement: $BACKUP_DIR/"