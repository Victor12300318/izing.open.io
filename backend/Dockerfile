# Estágio 1: Dependências Globais
# Atualizado para Node 20 para compatibilidade com bibliotecas modernas
FROM node:20-bookworm-slim AS global-deps-stage

WORKDIR /app

# --- CORREÇÃO FINAL ---
# Adicionado 'build-essential' e 'python3': Necessários para compilar o pacote 're2' e 'make'
# Mantido 'git' e 'ffmpeg' das correções anteriores
RUN apt-get update \
  && apt-get install -y wget gnupg nano ffmpeg git build-essential python3 \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && npm install pm2@latest -g

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=dev
ENV CHROME_BIN=google-chrome-stable

# Estágio 2: Instalação de pacotes Node
FROM global-deps-stage AS develop-stage
COPY package*.json ./

# Instala as dependências (agora com ferramentas de compilação C++ disponíveis)
RUN npm install

# Estágio 3: Build
FROM develop-stage AS build-stage
COPY . .
RUN npm run build

# Estágio 4: Produção
FROM build-stage AS production-stage
ENV NODE_ENV=production

COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
