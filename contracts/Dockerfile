FROM node:18.7.0-alpine

RUN mkdir -p /home/app

WORKDIR /home/app

COPY package*.json .

RUN npm install

RUN apk add make g++ python3

RUN npm -g install truffle

COPY . .

CMD ["sh", "-c", "tail -f /dev/null"]
