FROM node:20

# Install build tools for opencv4nodejs
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    cmake \
    pkg-config \
    libopencv-dev \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use prebuilt OpenCV libraries
ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1 \
    OPENCV_LIB_DIR=/usr/lib/x86_64-linux-gnu \
    OPENCV_INCLUDE_DIR=/usr/include/opencv4

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .



# Build the application
RUN npm run start:dev

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
