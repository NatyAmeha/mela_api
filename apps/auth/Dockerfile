FROM node:18.18-alpine
ENV NODE_ENV=development
WORKDIR /usr/src/app
RUN apk add openssl
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
# RUN chown -R node /usr/src/app
# USER node
RUN npx prisma generate --schema=./apps/auth/prisma/schema.prisma
# RUN npx prisma db push
CMD ["npm", "run", "start:dev", "auth"]
