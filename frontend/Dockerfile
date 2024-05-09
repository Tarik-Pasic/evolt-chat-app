FROM node:lts-alpine
ENV NODE_ENV=production
ENV API_URL=http://localhost:3001
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production=false --silent && mv node_modules ../
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
