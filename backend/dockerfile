FROM node:22.12.0

ENV DEBIAN_FRONTEND=noninteractive

# Crear usuario no-root
RUN adduser --disabled-password --gecos "" appuser

# Instalar dependencias del sistema necesarias para Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libxshmfence1 \
    libglu1-mesa \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Establecer carpeta de trabajo y copiar archivos
WORKDIR /app
COPY . .

# ✅ Cambiar permisos del directorio al usuario no-root
RUN chown -R appuser:appuser /app

# Instalar dependencias Node como root antes de cambiar de usuario
RUN npm install

# ✅ Cambiar al nuevo usuario no-root
USER appuser

EXPOSE 4000
CMD ["node", "index.js"]
