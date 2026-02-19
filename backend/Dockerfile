# Estágio 1: Base com ferramentas do sistema
FROM node:20-bookworm-slim AS base-stage

WORKDIR /app

# Instalação de dependências do sistema e Chrome
RUN apt-get update && apt-get install -y \
    wget gnupg nano ffmpeg git build-essential python3 \
    google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei \
    fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && npm install pm2@latest -g

# Links e Variáveis de Ambiente
RUN ln -sf /usr/bin/python3 /usr/bin/python
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=google-chrome-stable

# Estágio 2: Instalação (Instalamos TUDO para poder buildar)
FROM base-stage AS build-stage
COPY package*.json ./

# IMPORTANTE: Instalamos todas as dependências primeiro
RUN npm install

# Copia o código e executa o build
COPY . .
RUN npm run build

# Estágio 3: Produção (Limpamos as devDeps para o container final ficar leve)
FROM build-stage AS production-stage
# Aqui sim definimos como produção
ENV NODE_ENV=production

# Opcional: Remover dependências de desenvolvimento após o build
# RUN npm prune --production

COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
