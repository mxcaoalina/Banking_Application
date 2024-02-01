# Use the official Node.js 14 slim image from Docker Hub
FROM node:14-slim

# Set metadata for the image
LABEL maintainer="student@example.com"
LABEL version="1.0"
LABEL description="Node.js application"

# Set the working directory inside the container to /app
WORKDIR /app

COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem
COPY . .


# Define the command to run your app using CMD which defines your runtime
CMD ["node", "index.js"]