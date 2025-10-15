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

# Build TypeScript
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

# Install prisma CLI temporarily for generation
RUN npm install -D prisma

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client in production environment
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy the generated Prisma client from builder stage to ensure completeness
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Remove prisma CLI after everything is copied to keep image small
RUN npm uninstall prisma

# Expose the port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]

