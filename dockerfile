FROM node:18.20.4-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./

RUN npx tsc

###

FROM node:18.20.4-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist

COPY --from=build /app/package*.json ./

RUN npm install --omit:dev

EXPOSE 3000

CMD ["node","./dist/src/index.js"]