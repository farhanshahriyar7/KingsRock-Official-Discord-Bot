FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm install -g typescript
RUN tsc
CMD ["node", "dist/index.js"]
