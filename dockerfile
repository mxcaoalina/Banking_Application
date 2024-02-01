# Use the official Node.js 14 slim image from Docker Hub
FROM node:14-slim

# Set metadata for the image
LABEL maintainer="student@example.com"
LABEL version="1.0"
LABEL description="Node.js application"

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
# to speed up build process when dependencies don't change
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of your app's source code from your host to your image filesystem
COPY . .

# Inform Docker that the container listens on port 3000 at runtime
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD ["node", "index.js"]