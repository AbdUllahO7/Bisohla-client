FROM node:20-alpine AS builder

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

ARG APP_URL
ENV APP_URL=$APP_URL

ARG NEXT_TELEMETRY_DISABLED
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# Build the application
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app


# Set NODE_ENV to production
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
