# Dockerfile

FROM node:14.4.0-buster-slim

# Select node user
USER node
# Create app directory
RUN mkdir /home/node/app && chown -R node:node /home/node/app && mkdir /home/node/app/public
WORKDIR /home/node/app

# Install solely package.json first
COPY package*.json ./
RUN npm install

# Now copy the app and static files
COPY ./index.js ./
COPY ./public/* ./public/

# Expose app port and run
EXPOSE 1800
CMD [ "npm", "run", "start" ]
