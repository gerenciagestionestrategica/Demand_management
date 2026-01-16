# Stage 1: Build Angular SPA
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar todo el proyecto
COPY . .

# Build Angular (solo navegador)
RUN npm run build

# Stage 2: Servir con Nginx
FROM nginx:alpine

# Necesario para usar plantillas en Nginx
RUN apk add --no-cache gettext

# Copiar PLANTILLA de configuración
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copiar la aplicación Angular compilada
COPY --from=build /app/dist/frontend-demand-management/browser /usr/share/nginx/html/

# Exponer el puerto configurado (normalmente 80)
EXPOSE 80

# Nginx generará automáticamente default.conf desde la plantilla
CMD ["nginx", "-g", "daemon off;"]
