FROM node:22.12.0
# Crear directorio de trabajo
WORKDIR /app
# Copiar package.json y package-lock.json
COPY package*.json ./
# Instalar dependencias
RUN npm install
# Copiar el resto de la aplicación
COPY . .
# Exponer el puerto 4000
EXPOSE 3000
# Comando para iniciar la aplicación
CMD ["npm", "start"]