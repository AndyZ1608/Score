FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY prisma/schema.prisma ./prisma/
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json ./
COPY prisma/schema.prisma ./prisma/
RUN npm install --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/scripts ./scripts

RUN sed -i 's/\r$//' scripts/start.sh && chmod +x scripts/start.sh && chown -R node:node /app

USER node

EXPOSE 3000
CMD ["sh", "scripts/start.sh"]
