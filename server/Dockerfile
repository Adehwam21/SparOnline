FROM node:20-alpine as builder

# Install Git in the alpine image
RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 2567
CMD ["node", "dist/index.js"]
