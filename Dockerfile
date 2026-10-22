FROM node:24-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Set environment variables from build args
ARG SESSION_SECRET_KEY
ENV SESSION_SECRET_KEY=$SESSION_SECRET_KEY

ARG SESSION_SECRET_KEY_ALGORITHM
ENV SESSION_SECRET_KEY_ALGORITHM=$SESSION_SECRET_KEY_ALGORITHM

ARG SESSION_SECRET_KEY_EXPIRATION_TIME
ENV SESSION_SECRET_KEY_EXPIRATION_TIME=$SESSION_SECRET_KEY_EXPIRATION_TIME

ARG COOKIE_DOMAIN
ENV COOKIE_DOMAIN=$COOKIE_DOMAIN

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

ARG APP_ENV
ENV APP_ENV=$APP_ENV
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

ARG APP_URL
ENV APP_URL=$APP_URL

ARG PM2_APP_NAME
ENV PM2_APP_NAME=$PM2_APP_NAME

ARG NEXT_TELEMETRY_DISABLED
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# Build the application
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app

# Install PM2 globally for process management
RUN npm install -g pm2

# Set NODE_ENV to production
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy PM2 ecosystem configuration
COPY ecosystem.config.js ./

# Expose the port
EXPOSE 3000

# Start the application with PM2
# PM2 provides:
# - Auto-restart on crash
# - Memory monitoring
# - Graceful shutdown
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
