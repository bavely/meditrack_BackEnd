FROM node:18

# Install build tools for opencv4nodejs
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
