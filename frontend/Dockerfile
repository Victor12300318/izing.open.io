# Estágio 1: Build
FROM node:20-bookworm-slim AS build-stage

WORKDIR /app

# Instala git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# --- AQUI ESTÁ A CORREÇÃO BLINDADA ---
# Definimos as 3 variações mais comuns de nome de variável para garantir
ENV URL_API="https://crm-izing-back.xjbony.easypanel.host"
ENV VUE_URL_API="https://crm-izing-back.xjbony.easypanel.host"
ENV BACKEND_URL="https://crm-izing-back.xjbony.easypanel.host"

# Executa o build
RUN npx quasar build -m pwa

# Estágio 2: Produção
FROM node:20-bookworm-slim AS production-stage
WORKDIR /app
RUN npm install -g serve
COPY --from=build-stage /app/dist/pwa .
EXPOSE 3006
CMD ["serve", "-s", ".", "-l", "3006"]
