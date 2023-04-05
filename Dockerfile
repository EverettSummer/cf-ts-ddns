FROM node:19-alpine AS base
WORKDIR /app

FROM base AS dev
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
COPY . /app/

FROM dev AS prod
RUN npm run build

ENV HOME=/app