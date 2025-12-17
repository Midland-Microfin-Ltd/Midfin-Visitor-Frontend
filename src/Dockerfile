FROM node:20-alpine AS builder

WORKDIR /var/frontend

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


FROM node:20-alpine

WORKDIR /var/frontend

RUN npm install -g serve

# Copy build output
COPY --from=builder /var/frontend/dist ./dist
# If CRA use ./build

EXPOSE 5500

CMD ["serve", "-s", "dist", "-l", "5500"]