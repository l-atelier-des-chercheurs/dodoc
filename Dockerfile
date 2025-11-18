# = Do.Doc Docker =

# == Base for build ==

FROM node:22.19-slim AS build-base

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

# Install server dependencies
WORKDIR /src/l-atelier-des-chercheurs/dodoc
COPY package*.json ./
RUN npm ci --only=production

# == Serving ==

FROM node:22.19-slim

# Install chromium
RUN apt update && apt install -y --no-install-recommends chromium && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 8080

USER node
WORKDIR /src/l-atelier-des-chercheurs/dodoc

COPY . .
COPY --from=build-server /src/l-atelier-des-chercheurs/dodoc/node_modules node_modules

HEALTHCHECK --interval=5s \
            --timeout=5s \
            --retries=6 \
            CMD curl -fs http://localhost:8080/ || exit 1

CMD ["npm", "run", "start"]
