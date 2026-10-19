# = Do.Doc Docker =

# == Base for build ==

FROM node:24.22.0-slim AS build-base

RUN apt update && apt install -y --no-install-recommends \
    build-essential \
    python3 \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# == Server ==

FROM build-base AS build-server

# Configure for production
ENV NODE_ENV=production
# Chromium comes from apt in the serving image: don't let Puppeteer download Chrome at install
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install server dependencies
WORKDIR /src/l-atelier-des-chercheurs/dodoc
COPY package*.json ./
COPY packages/adc-core/package.json ./packages/adc-core/
COPY scripts/ ./scripts/
RUN npm ci --omit=dev \
    && test ! -d node_modules/electron

# == Serving ==

FROM node:24.22.0-slim

# Install chromium (Puppeteer fallback) and poppler-utils (pdftoppm for PDF thumbnails)
RUN apt update && apt install -y --no-install-recommends chromium poppler-utils && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 8080

USER node
WORKDIR /src/l-atelier-des-chercheurs/dodoc

# Configure Data Folder
RUN mkdir -p /home/node/Documents/dodoc; chown -R node:node /home/node/Documents/dodoc
COPY . .
COPY --from=build-server /src/l-atelier-des-chercheurs/dodoc/node_modules node_modules

HEALTHCHECK --interval=5s \
            --timeout=5s \
            --retries=6 \
            CMD curl -fs http://localhost:8080/ || exit 1

CMD ["npm", "run", "start"]
