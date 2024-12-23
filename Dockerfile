FROM node:23-alpine

WORKDIR /conslifeback

COPY . .

RUN npm install

CMD ["node", "app.js"]

EXPOSE 8010