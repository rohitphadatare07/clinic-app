# Build stage
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
# This leverages Docker cache to avoid reinstalling dependencies if only code changes
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the app for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built app from the builder stage to the nginx html directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy a custom nginx configuration file (if you have one, optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Command to run nginx (this is already the default command in the nginx image)
CMD ["nginx", "-g", "daemon off;"]