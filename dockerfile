FROM node:18.20.4-alpine

ENV NODE_EN=production

COPY package*.json ./

RUN npm install

COPY . ./

RUN npx tsc

EXPOSE 3000

CMD ["node","./dist/src/index.js"]