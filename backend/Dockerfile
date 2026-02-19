# Estágio 1: Base com ferramentas do sistema
FROM node:20-bookworm-slim AS base-stage

WORKDIR /app

# Instalação de dependências do sistema e Chromium (Adicionado certificados e openssh)
RUN apt-get update && apt-get install -y \
 wget gnupg nano ffmpeg git build-essential python3 \
 chromium fonts-ipafont-gothic fonts-wqy-zenhei \
 fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
 openssh-client ca-certificates \
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
# 1. Configura o Git para aceitar diretórios e usar HTTPS
# 2. Substitui o atalho SSH problemático do whatsapp-web.js pela URL HTTPS explícita
RUN git config --global --add safe.directory '*' \
    && git config --global url."https://github.com/".insteadOf "git://github.com/" \
    && git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" \
    && sed -i 's|"github:devlikeapro/whatsapp-web.js"|"git+https://github.com/devlikeapro/whatsapp-web.js.git"|g' package.json \
    && rm -f package-lock.json \
    && npm cache clean --force \
    && npm install --include=dev

# Estágio 3: Build
FROM develop-stage AS build-stage
COPY . .
RUN npm run build

# Estágio 4: Produção
FROM build-stage AS production-stage
ENV NODE_ENV=production

COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Entrypoint corrigido e no formato JSON exigido pelo Docker!
ENTRYPOINT
