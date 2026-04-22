# Multi-stage build for production optimization
FROM node:18-alpine AS builder

# Declare build-time env vars (set via --build-arg in CI)
ARG VITE_POSTHOG_KEY=""
ARG VITE_POSTHOG_HOST=""
ARG VITE_GLITCHTIP_DSN=""

# Make them visible to Vite during build
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST
ENV VITE_GLITCHTIP_DSN=$VITE_GLITCHTIP_DSN

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - use the same base image
FROM node:18-alpine AS production

# Install serve package for static file serving
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start the application
CMD ["serve", "-s", "-l", "8080", "/app"]
