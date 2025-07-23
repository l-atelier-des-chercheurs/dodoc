FROM node:20-bullseye-slim

RUN apt update && apt install -y \
    build-essential libvips libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

WORKDIR /dodoc

COPY --link . ./

RUN npm install

ENTRYPOINT [ "npm", "run" ]
