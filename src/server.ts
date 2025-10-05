import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { sequelize } from "./db/sequelize.js";
import { router as apiRouter } from "./routes/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", apiRouter);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
