FROM node

WORKDIR /conslifeback

COPY . .

RUN npm install

CMD ["node", "app.js"]

EXPOSE 8010