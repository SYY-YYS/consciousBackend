FROM node

ENV NODE_ENV development

WORKDIR /conslifeback

COPY . .

RUN npm install

CMD ["node", "app.js"]

EXPOSE 8010