FROM node:16.16.0-alpine

RUN apk add make g++ python3

RUN mkdir -p /home/app

WORKDIR /home/app

COPY package*.json .

RUN npm install

RUN npm -g install truffle

COPY . .

CMD ["sh", "-c", "tail -f /dev/null"]
