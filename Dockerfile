# = Do.Doc  Docker =
# == Base for build ==
FROM node:8.9.3-alpine AS build-base
RUN apk --update --no-cache add python2 build-base git ca-certificates wget file fftw-dev sudo && \
    update-ca-certificates

# Install global dependencies
RUN npm i extract-zip
RUN sudo npm install -g electron node-gyp --unsafe-perm=true --allow-root --save-dev --save-exact
RUN npm i ajv

# Ready to start do.doc specific dependencies

# == Client ==
FROM build-base AS build-client
# Install client dependencies
WORKDIR /src/l-atelier-des-chercheurs/dodoc/public/
COPY public/package*.json ./
RUN npm install --unsafe-perm=true 
COPY public /src/l-atelier-des-chercheurs/dodoc/public
#RUN npm run dev --unsafe-perm=true && npm run build --unsafe-perm=true 
RUN npm run build --unsafe-perm=true


# == server ==
FROM build-base AS build-server
# Install server dependencies
WORKDIR /src/l-atelier-des-chercheurs/dodoc
COPY package*.json ./
RUN npm install --unsafe-perm=true 
COPY . /src/l-atelier-des-chercheurs/dodoc/
RUN npm build --unsafe-perm=true 

# == Serving ==
FROM node:8.9.3-alpine

RUN apk add --update --no-cache curl

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      harfbuzz@edge \
      freetype@edge \
      ttf-freefont@edge

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN yarn add puppeteer@1.17

# Add user so we don't need --no-sandbox.
# RUN addgroup -S node && adduser -S -g node node \
RUN mkdir -p /home/node/Downloads \
    && chown -R node:node /home/node
#    && chown -R node:node /application

EXPOSE 8080

WORKDIR /src/l-atelier-des-chercheurs/dodoc

COPY . .
COPY --from=build-server /src/l-atelier-des-chercheurs/dodoc/node_modules node_modules
COPY --from=build-client /src/l-atelier-des-chercheurs/dodoc/public/dist/ /src/l-atelier-des-chercheurs/dodoc/public/dist/
COPY --from=build-base /usr/local/lib/node_modules /usr/local/lib/node_modules

HEALTHCHECK --interval=5s \
            --timeout=5s \
            --retries=6 \
            CMD curl -fs http://localhost:8080/ || exit 1

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

USER node
CMD npm run debug