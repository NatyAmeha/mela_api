FROM node:18.18-alpine
# ENV NODE_ENV=development
WORKDIR /usr/src/app
RUN apk add build-base

RUN apk add python3
RUN npm install -g node-gyp
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN chmod -R node /usr/src/ap
RUN npm install
RUN npm install -g prisma
COPY . .
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate --schema=./apps/order_service/prisma/schema.prisma
# RUN apt-get update -y && apt-get install -y openssl
# RUN npx prisma db push
CMD ["npm", "run", "start:dev", "order_service"]
