FROM node:lts-alpine
ENV NODE_ENV=production
ENV FRONTEND_HOST=http://localhost:3000
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3001
CMD ["npm", "start"]