# Pull from latest PM2 image
FROM keymetrics/pm2:latest

# Set default api port to 8080
ENV PORT 8080

# Set NODE_ENV to production
ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL info

# Copy package.json adn yarn.lock
COPY package.json /build/
COPY yarn.lock /build/

# Set the working directory
WORKDIR /build

# Copy the built application
COPY /build build

# Install node modules
RUN npm install --production

# Copy the PM2 config
COPY pm2.json .

# Expose the external port
EXPOSE 8080

CMD [ "pm2-docker", "start", "pm2.json" ]