#!/bin/bash

# Script pour consulter les logs facilement

case "$1" in
    "backend"|"api")
        echo "📊 Logs Backend API..."
        docker-compose logs -f --tail=100 backend
        ;;
    "frontend"|"web")
        echo "🌐 Logs Frontend..."
        docker-compose logs -f --tail=100 frontend
        ;;
    "db"|"database")
        echo "🗄️ Logs Base de données..."
        docker-compose logs -f --tail=100 db
        ;;
    "redis")
        echo "🔄 Logs Redis..."
        docker-compose logs -f --tail=100 redis
        ;;
    "all"|"")
        echo "📋 Logs de tous les services..."
        docker-compose logs -f --tail=50
        ;;
    *)
        echo "Usage: $0 [backend|frontend|db|redis|all]"
        echo "Exemple: $0 backend"
        exit 1
        ;;
esac