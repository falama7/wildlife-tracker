#!/bin/bash
# scripts/fix-build.sh - Script de correction pour l'erreur de build

echo "🔧 Correction de l'erreur de build Wildlife Tracker"
echo "=================================================="

# Nettoyer les containers et images existants
echo "🧹 Nettoyage des containers existants..."
docker-compose down -v
docker system prune -f

# Créer la structure des répertoires
echo "📁 Création de la structure complète..."
mkdir -p frontend/src/{components,pages,services}
mkdir -p frontend/public
mkdir -p backend/app/{models,routes,services,utils}
mkdir -p uploads backups logs

# Créer les fichiers manquants pour le frontend

# 1. package.json
echo "📝 Création du package.json corrigé..."
cat > frontend/package.json << 'EOF'
{
  "name": "wildlife-tracker-frontend",
  "version": "1.0.0",
  "description": "Interface web pour le suivi des espèces dans les parcs nationaux",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.5.2",
    "leaflet": "^1.9.4",
    "leaflet-draw": "^1.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "react-leaflet-draw": "^0.20.4",
    "react-router-dom": "^6.20.1",
    "react-scripts": "5.0.1",
    "recharts": "^2.8.0",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:8000"
}
EOF

# 2. index.html
echo "📝 Création de index.html..."
cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#10b981" />
    <meta name="description" content="Système de suivi des espèces dans les parcs nationaux" />
    <title>Wildlife Tracker - Suivi des Espèces</title>
  </head>
  <body>
    <noscript>Vous devez activer JavaScript pour utiliser cette application.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# 3. index.js
echo "📝 Création de index.js..."
cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# 4. index.css
echo "📝 Création de index.css..."
cat > frontend/src/index.css << 'EOF'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

# 5. Dockerfile corrigé
echo "📝 Correction du Dockerfile frontend..."
cat > frontend/Dockerfile << 'EOF'
# Stage de build
FROM node:18-alpine as build

# Variables d'environnement pour le build
ENV NODE_ENV=development

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (nécessaire pour react-scripts)
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Stage de production avec nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
EOF

# 6. nginx.conf
echo "📝 Création de nginx.conf..."
cat > frontend/nginx.conf << 'EOF'
server {
    listen 3000;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Gestion des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# 7. docker-compose.yml corrigé (sans version obsolète)
echo "📝 Correction du docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  # Base de données PostgreSQL avec PostGIS
  db:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: wildlife_tracker
      POSTGRES_USER: wildlife_user
      POSTGRES_PASSWORD: wildlife_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - wildlife_network
    restart: unless-stopped

  # API Backend FastAPI
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://wildlife_user:wildlife_password@db:5432/wildlife_tracker
      SECRET_KEY: your-secret-key-change-in-production
      CORS_ORIGINS: http://localhost:3000
    depends_on:
      - db
    volumes:
      - ./backend:/app
      - uploaded_files:/app/uploads
    networks:
      - wildlife_network
    restart: unless-stopped

  # Frontend React
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    depends_on:
      - backend
    networks:
      - wildlife_network
    restart: unless-stopped

  # Redis pour la mise en cache (optionnel)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - wildlife_network
    restart: unless-stopped

volumes:
  postgres_data:
  uploaded_files:

networks:
  wildlife_network:
    driver: bridge
EOF

# Créer les fichiers manquants pour le backend
echo "📝 Création des fichiers backend manquants..."

# __init__.py files
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/routes/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py

# Reconstruire sans cache
echo "🏗️ Reconstruction des images Docker..."
docker-compose build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que la base soit prête
echo "⏳ Attente de la base de données..."
sleep 15

# Vérifier le statut
echo "🔍 Vérification du statut..."
docker-compose ps

echo ""
echo "✅ Correction terminée!"
echo ""
echo "🌐 Accès à l'application:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8000"
echo "   Documentation: http://localhost:8000/docs"
echo ""
echo "🔐 Connexion par défaut:"
echo "   Utilisateur: admin"
echo "   Mot de passe: admin123"