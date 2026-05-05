# front-end build
FROM node:20-alpine AS build-stage
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# back-end build
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend/ ./backend/

# build copy from /public backend
COPY --from=build-stage /app/frontend/dist ./backend/public


EXPOSE 3003
CMD ["node", "backend/src/server.js"]
