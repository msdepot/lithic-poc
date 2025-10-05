import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const USE_SQLITE = process.env.USE_SQLITE === "1";
const SQLITE_PATH = process.env.SQLITE_PATH || "dev.db";
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/lithic_poc";

export const sequelize = USE_SQLITE
  ? new Sequelize({ dialect: "sqlite", storage: SQLITE_PATH, logging: false })
  : new Sequelize(DATABASE_URL, { dialect: "postgres", logging: false });
