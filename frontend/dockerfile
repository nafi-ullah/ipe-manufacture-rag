# Use the official Node.js 14 image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 3000


# # Build the application
RUN npm run build

# Copy the prerender-manifest.json file to the .next directory
# COPY prerender-manifest.json .next/prerender-manifest.json

# # Start the application
CMD ["npm", "start"]

# CMD [ "npm", "run", "dev"]