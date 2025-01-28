FROM node:18.18-alpine
# ENV NODE_ENV=development
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN chmod -R node /usr/src/ap
RUN npm config set fetch-timeout 60000
RUN npm config set fetch-retries 5
# RUN npm cache clean --force
RUN npm install --no-optional
# RUN npm install -g prisma


COPY . .
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

RUN npx prisma generate --schema=./apps/auth/prisma/schema.prisma

RUN npx nest build auth
# RUN apt-get update -y && apt-get install -y openssl
# RUN npx prisma db push
CMD ["npm", "run", "start:prod:auth"]

