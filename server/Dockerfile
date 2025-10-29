FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["node", "src/server.js"]
