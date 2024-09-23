# Use the official Node.js image as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
COPY .env /app/.env
COPY sa.json /app/service-account.json

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "main.js"]