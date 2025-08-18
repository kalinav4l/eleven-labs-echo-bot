
# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install Node.js for running edge functions if needed
RUN apk add --no-cache nodejs npm

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create a startup script to inject environment variables
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Set environment variables with defaults
ENV NODE_ENV=production
ENV VITE_APP_URL=http://localhost
ENV SUPABASE_URL=https://pwfczzxwjfxomqzhhwvj.supabase.co
ENV SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZmN6enh3amZ4b21xemhod3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDI5NDYsImV4cCI6MjA2NDAxODk0Nn0.IgOvpvhe3fW4OnRLN39eVfP5E1hq4lHat0lZH_1jQfs
ENV VITE_ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
ENV VITE_DEFAULT_MODEL_ID=eleven_flash_v2_5
ENV VITE_AGENT_PHONE_NUMBER_ID=phnum_9501k2y60kzjfr98sybbze66vy2x
# Use the startup script as entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
