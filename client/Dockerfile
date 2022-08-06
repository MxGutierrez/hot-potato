FROM node:16.16.0-alpine

RUN apk add make g++ python3

RUN mkdir -p /home/app

WORKDIR /home/app

COPY package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
