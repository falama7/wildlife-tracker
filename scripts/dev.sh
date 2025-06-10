#!/bin/bash

# Script pour le développement local

case "$1" in
    "start")
        echo "🚀 Démarrage en mode développement..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
        ;;
    "stop")
        echo "🛑 Arrêt des services de développement..."
        docker-compose down
        ;;
    "test")
        echo "🧪 Exécution des tests..."
        docker-compose exec backend pytest tests/ -v
        docker-compose exec frontend npm test -- --coverage --watchAll=false
        ;;
    "migrate")
        echo "🗄️ Création d'une migration..."
        docker-compose exec backend alembic revision --autogenerate -m "$2"
        ;;
    "shell")
        if [ "$2" = "backend" ]; then
            docker-compose exec backend bash
        elif [ "$2" = "frontend" ]; then
            docker-compose exec frontend bash
        else
            echo "Usage: $0 shell [backend|frontend]"
        fi
        ;;
    *)
        echo "Usage: $0 [start|stop|test|migrate|shell]"
        echo "Exemples:"
        echo "  $0 start                    # Démarrer en mode dev"
        echo "  $0 test                     # Lancer les tests"
        echo "  $0 migrate 'nom migration'  # Créer une migration"
        echo "  $0 shell backend            # Shell dans le backend"
        exit 1
        ;;
esac