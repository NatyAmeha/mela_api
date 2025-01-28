FROM node:18.18-alpine
# ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN chmod -R node /usr/src/ap
RUN npm config set fetch-timeout 60000
RUN npm config set fetch-retries 5
RUN npm install --no-optional

COPY . .
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate --schema=./apps/order_service/prisma/schema.prisma
# RUN apt-get update -y && apt-get install -y openssl
# RUN npx prisma db push
RUN npx nest build order_service
CMD ["npm", "run", "start:prod:order"]
