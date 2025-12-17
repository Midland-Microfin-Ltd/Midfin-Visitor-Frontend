FROM node:20-alpine AS builder

WORKDIR /var/frontend

# 🔹 Declare build-time envs
ARG VITE_ENVIRONMENT
ARG VITE_HOST_DOMAIN
ARG VITE_API_TIMEOUT

ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_HOST_DOMAIN=$VITE_HOST_DOMAIN
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build
# =====================
FROM node:20-alpine

WORKDIR /var/frontend

RUN npm install -g serve

COPY --from=builder /var/frontend/dist ./dist

EXPOSE 5500

CMD ["serve", "-s", "dist", "-l", "5500"]