FROM node:8.9-wheezy

# Set default api port to 80
ENV PORT 80

# Set NODE_ENV to production
ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL info

# Set the database server and secret
ENV MONGO_URI mongodb://admin:yGr0y63IdMWQ0fP1@ftc-tournament-server-test-shard-00-00-0pe2a.mongodb.net:27017,ftc-tournament-server-test-shard-00-01-0pe2a.mongodb.net:27017,ftc-tournament-server-test-shard-00-02-0pe2a.mongodb.net:27017/test?ssl=true&replicaSet=ftc-tournament-server-test-shard-0&authSource=admin
ENV SECRET 491234kjsadfhjkfdsahkj23489234khjafsd234

# Copy package.json and yarn.lock
COPY package.json /build/
COPY yarn.lock /build/

# Set the working directory
WORKDIR /build

# Copy the built application
COPY /build build

# Install node modules
RUN yarn install

# Expose the external port
EXPOSE 80

CMD [ "node", "./build/index" ]