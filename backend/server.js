import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import TestRecord from "./models/TestRecord.js";

// Налаштування для ES Modules, щоб працювали шляхи до папок
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Звертаємося до сервісу K8s по його імен
const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:password@mongodb-service:27017/testdb?authSource=admin";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const connectWithRetry = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection failed. Retrying in 5 seconds...", err.message);
    setTimeout(connectWithRetry, 5000); // Чекаємо 5 секунд і пробуємо знову
  }
};

connectWithRetry();

// === ТУТ ТВОЇ API МАРШРУТИ ===
app.get("/api/records", async (req, res) => {
  const records = await TestRecord.find().sort({ createdAt: -1 });
  res.json(records);
});

app.post("/api/records", async (req, res) => {
  const record = await TestRecord.create({
    name: `Test ${Date.now()}`,
    createdAt: new Date(),
  });
  res.json(record);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// РОЗДАЧА ФРОНТЕНДУ
// Вказуємо Express роздавати статику з папки public
app.use(express.static(path.join(__dirname, 'public')));

// Fallback для React Router: всі запити, які не є API, направляємо на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));