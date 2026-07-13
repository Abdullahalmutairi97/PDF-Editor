# Dockerfile for ArabiTools — includes all PDF/image CLI tools
FROM node:22-slim

# Install system dependencies for PDF/image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    qpdf \
    ghostscript \
    poppler-utils \
    imagemagick \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source and build
COPY . .
RUN npm run build

# Expose the port
ENV PORT=3000
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "run", "start", "--", "-p", "3000"]
