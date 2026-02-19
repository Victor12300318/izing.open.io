# Estágio 1: Base com ferramentas do sistema
FROM node:20-bookworm-slim AS base-stage

WORKDIR /app

# Instalação de dependências do sistema e Chromium
RUN apt-get update && apt-get install -y \
 wget gnupg nano ffmpeg git build-essential python3 \
 chromium fonts-ipafont-gothic fonts-wqy-zenhei \
 fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
 --no-install-recommends \
 && rm -rf /var/lib/apt/lists/* \
 && npm install pm2@latest -g

# Links e Variáveis de Ambiente
RUN ln -sf /usr/bin/python3 /usr/bin/python
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=/usr/bin/chromium 

# Estágio 2: Instalação
FROM base-stage AS develop-stage
COPY package*.json ./

# CORREÇÃO DO ERRO 128: 
# 1. Apaga o lockfile antigo.
# 2. Troca o fork do Github deletado pela versão oficial (1.34.1) no package.json
RUN rm -f package-lock.json \
    && sed -i -E 's/"whatsapp-web.js": "github:+"/"whatsapp-web.js": "^1.34.1"/g' package.json \
    && npm config set fetch-retry-maxtimeout 600000 \
    && HUSKY=0 npm install --include=dev

# Estágio 3: Build
FROM develop-stage AS build-stage
COPY . .
RUN npm run build

# Estágio 4: Produção
FROM build-stage AS production-stage
ENV NODE_ENV=production

COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Entrypoint corrigido corretamente
ENTRYPOINT
