# Email Engine Core

Email Engine Core is a robust platform for managing emails and mailboxes. It includes a server-side API, a client-side interface, and WebSocket support for real-time updates.

## Features

- User registration and authentication using Microsoft
- Email synchronization
- Real-time email and mailbox updates via WebSocket
- Simple client interface for viewing emails and mailboxes

## Prerequisites

- Node.js
- Docker
- Docker Compose

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codejunkiepro/email-engine-core.git
   cd email-engine-core
   ```
2. **Start services using Docker Compose**
   ```bash
   docker-compose up
   ```

## Running the App

1. **Access the application**

   Open your browser and navigate to http://localhost:3000.

## Folder Structure

- api/: Contains server-side code
- client/: Contains client-side code
- docker-compose.yml: Docker Compose configuration

## Docker Compose Configuration

```yaml
version: "3.8"
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.1
    container_name: elasticsearch
    ports:
      - "9200:9200"
      - "9300:9300"
    environment:
      - discovery.type=single-node
    networks:
      - mynetwork

  mongodb:
    image: mongo:4
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: username
      MONGO_INITDB_ROOT_PASSWORD: password
    networks:
      - mynetwork

  api:
    build: ./api
    container_name: api_backend
    ports:
      - "4000:4000"
    volumes:
      - ./api:/app
      - ./api/node_modules:/app/node_modules
      - ./api/database.sqlite:/app/database.sqlite
    env_file:
      - .env
    networks:
      - mynetwork

  client:
    build: ./client
    container_name: client_frontend
    ports:
      - "3000:3000"
    volumes:
      - ./client:/app
      - ./client/node_modules:/app/node_modules
    env_file:
      - .env
    stdin_open: true
    tty: true
    networks:
      - mynetwork

networks:
  mynetwork:
    driver: bridge
```

## Backend Dockerfile

```Dockerfile
FROM node:20-alpine

RUN npm install -g nodemon

WORKDIR /app

COPY package.json .

RUN chown -R node:node /app

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
```

## Frontend Dockerfile

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN chown -R node:node /app

USER node

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## API Endpoints

- **Register User**: `POST /auth/register`
- **Sync Emails**: `GET /api/sync`

## WebSocket Events

- **emailUpdate**: Sent when there is a new email
- **mailboxUpdate**: Sent when there is a mailbox update

## Contributing

Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.

For more details, visit the [GitHub repository](https://github.com/codejunkiepro/email-engine-core).
