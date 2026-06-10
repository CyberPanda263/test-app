# Етап 1: Фронтенд
FROM node:22-slim AS frontend-builder
WORKDIR /frontend
# Одразу копіюємо весь код фронтенду
COPY frontend/ .
# Встановлюємо залежності і збираємо в одному шарі (щоб Kaniko не поламав права)
RUN npm ci && npm run build 

# Етап 2: Бекенд + Фронтенд
FROM node:22-slim
WORKDIR /app
# Копіюємо бекенд
COPY backend/ .
# Встановлюємо залежності бекенду
RUN npm ci
# Копіюємо зібраний React
COPY --from=frontend-builder /frontend/dist ./public

EXPOSE 3001
CMD ["node", "server.js"]