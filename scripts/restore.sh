#!/bin/bash

# Script de restauration
set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_date>"
    echo "Exemple: $0 20240115_143022"
    echo ""
    echo "Sauvegardes disponibles:"
    ls -la backups/ | grep wildlife_tracker_backup_ | awk '{print $9}' | sed 's/wildlife_tracker_backup_//g' | sed 's/_.*//g' | sort -u
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="./backups"
BACKUP_PREFIX="wildlife_tracker_backup_${BACKUP_DATE}"

echo "🔄 Restauration de Wildlife Tracker - $BACKUP_DATE"
echo "================================================"

# Vérifier que les fichiers existent
if [ ! -f "$BACKUP_DIR/${BACKUP_PREFIX}_database.sql.gz" ]; then
    echo "❌ Fichier de sauvegarde non trouvé: ${BACKUP_PREFIX}_database.sql.gz"
    exit 1
fi

echo "⚠️ Cette opération va écraser les données actuelles!"
read -p "Voulez-vous continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restauration annulée"
    exit 1
fi

# Arrêter les services
echo "🛑 Arrêt des services..."
docker-compose down

# Restaurer la base de données
echo "🗄️ Restauration de la base de données..."
docker-compose up -d db
sleep 10
zcat "$BACKUP_DIR/${BACKUP_PREFIX}_database.sql.gz" | docker-compose exec -T db psql -U wildlife_user wildlife_tracker

# Restaurer les fichiers
if [ -f "$BACKUP_DIR/${BACKUP_PREFIX}_uploads.tar.gz" ]; then
    echo "📁 Restauration des fichiers..."
    tar -xzf "$BACKUP_DIR/${BACKUP_PREFIX}_uploads.tar.gz"
fi

# Restaurer la configuration
if [ -f "$BACKUP_DIR/${BACKUP_PREFIX}_config.env" ]; then
    echo "⚙️ Restauration de la configuration..."
    cp "$BACKUP_DIR/${BACKUP_PREFIX}_config.env" .env
fi

# Redémarrer tous les services
echo "🚀 Redémarrage des services..."
docker-compose up -d

echo "✅ Restauration terminée!"