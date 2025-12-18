# Estágio 1: Build da Aplicação
FROM node:20-bookworm-slim AS build-stage

WORKDIR /app

# Instala o git (necessário para algumas dependências)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copia os arquivos de configuração
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o código fonte
COPY . .

# Argumentos de Build (Variáveis de Ambiente que precisam ser "assadas" no código)
# O Quasar usa isso no momento do build para saber onde está o backend
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

# Executa o build no modo PWA (Progressive Web App)
RUN npx quasar build -m pwa

# Estágio 2: Servidor de Produção
FROM node:20-bookworm-slim AS production-stage

WORKDIR /app

# Instala um servidor estático simples e performático
RUN npm install -g serve

# Copia apenas os arquivos gerados no build anterior (pasta dist/pwa)
COPY --from=build-stage /app/dist/pwa .

# Expõe a porta 3006
EXPOSE 3006

# Inicia o servidor em modo SPA (-s evita erro 404 ao recarregar página)
CMD ["serve", "-s", ".", "-l", "3006"]
