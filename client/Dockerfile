FROM node:20-alpine

WORKDIR /app


COPY package.json .

# COPY package-lock.json .

RUN chown -R node:node /app

USER node

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]