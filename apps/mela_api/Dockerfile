FROM node:lts-alpine
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm config set fetch-timeout 60000
RUN npm config set fetch-retries 5
RUN npm install --no-optional

COPY . .
EXPOSE 8080
RUN npx nest build mela_api
CMD ["npm", "run", "start:prod:gateway"]
