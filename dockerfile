# Use the official Node.js 14 slim image from Docker Hub
FROM node:slim

# Set metadata for the image
LABEL maintainer="student@example.com"
LABEL version="1.0"
LABEL description="Node.js application"

# Set the working directory inside the container to /app
WORKDIR /app

COPY index.js /app/index.js
COPY package.json /app/package.json

# Install production dependencies
RUN npm install

# Define the command to run your app using CMD which defines your runtime
CMD ["node", "index.js"]