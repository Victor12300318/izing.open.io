# Estágio 1: Dependências Globais (Chrome, FFmpeg, Node)
FROM node:18-bookworm-slim AS global-deps-stage

WORKDIR /app

# Instala dependências do sistema.
# OBS: Removemos a versão fixa do ffmpeg para evitar erro 100.
RUN apt-get update \
  && apt-get install -y wget gnupg nano ffmpeg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && npm install pm2@latest -g

# Variáveis de ambiente configuradas corretamente
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=dev
ENV CHROME_BIN=google-chrome-stable

# Estágio 2: Instalação de pacotes Node
FROM global-deps-stage AS develop-stage
COPY package*.json ./
RUN npm install

# Estágio 3: Build do código TypeScript/Javascript
FROM develop-stage AS build-stage
COPY . .
RUN npm run build

# Estágio 4: Produção (Final)
FROM build-stage AS production-stage
ENV NODE_ENV=production

# Garante que o script de entrada existe e tem permissão de execução
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
