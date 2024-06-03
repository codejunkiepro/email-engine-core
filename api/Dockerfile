FROM node:20-alpine

RUN npm install -g nodemon

WORKDIR /app

COPY package.json .

RUN chown -R node:node /app

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]