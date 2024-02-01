# Use the official Node.js 14 slim image from Docker Hub
FROM node:slim

# Set metadata for the image
LABEL maintainer="student@example.com"
LABEL version="1.0"
LABEL description="Node.js application"

# Set the working directory inside the container to /app
WORKDIR /app

# Copy everything from the current directory into the /app directory in the container
COPY . /app

# Install production dependencies
RUN npm install

# List contents of /app to verify files are copied correctly
RUN ls -la /app

# Define the command to run your app
CMD ["node", "index.js"]