# To Build Run: docker build . -t Lianecx/MC-Linker

# FROM node:18
FROM node:18-slim
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3100
CMD [ "node", "main.js" ]