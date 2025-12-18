# Estágio 1: Build da Aplicação
FROM node:20-bookworm-slim AS build-stage

WORKDIR /app

# Instala git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# --- AQUI ESTÁ A CORREÇÃO ---
# Coloque a URL DO SEU BACKEND aqui (sem a barra / no final)
# Estou definindo as duas variáveis mais comuns usadas nesses forks do Izing
ENV BACKEND_URL="https://crm-izing.xjbony.easypanel.host"
ENV URL_API="https://crm-izing.xjbony.easypanel.host"

# Executa o build
RUN npx quasar build -m pwa

# Estágio 2: Servidor de Produção
FROM node:20-bookworm-slim AS production-stage
WORKDIR /app
RUN npm install -g serve
COPY --from=build-stage /app/dist/pwa .
EXPOSE 3006
CMD ["serve", "-s", ".", "-l", "3006"]
