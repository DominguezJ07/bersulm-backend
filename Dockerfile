FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

ENV NODE_ENV=production

COPY src/ ./src/
COPY jest.config.js ./

EXPOSE 3000

CMD ["node", "src/server.js"]
