# Dockerfile for Event and Venue Service (TypeScript + Prisma)

# ---- Stage 1: Dependencies ----
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# ---- Stage 2: Builder ----
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript (this creates the dist folder)
RUN npm run build

# ---- Stage 3: Production ----
FROM node:18-alpine AS runner
WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Install prisma CLI temporarily for migrations
RUN npm install -D prisma

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client in production environment
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Verify the dist structure was copied correctly
RUN echo "✅ Verifying dist folder structure..." && \
    ls -la /app/dist && \
    ls -la /app/dist/routes && \
    echo "✅ Dist folder structure verified"

# Copy the generated Prisma client from builder stage to ensure completeness
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Remove prisma CLI after everything is copied to keep image small
RUN npm uninstall prisma

# Cloud Run sets PORT environment variable automatically
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Create a proper startup script
COPY <<'EOF' /app/start.sh
#!/bin/sh
set -e

# Ensure we're in the right directory
cd /app

echo "📂 Working directory: $(pwd)"
echo "📋 Contents of /app/dist:"
ls -la dist/ || echo "❌ dist folder not found!"

echo "📋 Contents of /app/dist/routes:"
ls -la dist/routes/ || echo "❌ dist/routes folder not found!"

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete. Starting server..."
echo "🚀 Starting application with: node dist/index.js"

# Use exec to replace shell with node process
exec node dist/index.js
EOF

RUN chmod +x /app/start.sh

# Start the application with migrations
CMD ["/app/start.sh"]
