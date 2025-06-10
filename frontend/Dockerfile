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
