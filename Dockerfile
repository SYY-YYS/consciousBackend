FROM node

WORKDIR /conslifeback

COPY . .

RUN npm install

CMD ["node", "index.js"]

EXPOSE 8010