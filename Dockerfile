FROM node:20-bullseye-slim

RUN apt update && apt install -y \
    build-essential libvips libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    rm -rf /var/cache/apt && apt-get clean

WORKDIR /dodoc

COPY . ./

RUN npm install

ENTRYPOINT [ "npm", "run" ]
