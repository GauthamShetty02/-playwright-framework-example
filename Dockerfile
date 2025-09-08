FROM mcr.microsoft.com/playwright:v1.40.0-noble

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Default command
CMD ["npx", "playwright", "test"]