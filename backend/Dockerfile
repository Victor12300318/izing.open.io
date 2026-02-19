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

# Previne o erro "exit code: 128" do Git/Husky durante a instalação
RUN git init \
    && git config --global url."https://github.com/".insteadOf git://github.com/ \
    && git config --global url."https://github.com/".insteadOf ssh://git@github.com/ \
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

# Entrypoint no formato JSON correto (Isso remove o Warning da linha 38)
ENTRYPOINT
