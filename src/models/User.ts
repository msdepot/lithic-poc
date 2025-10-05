import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../db/sequelize.js";

export type Role = "owner" | "super_admin" | "admin" | "user" | "analyst";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare role: Role;
  declare businessId: number;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    role: { type: DataTypes.ENUM("owner", "super_admin", "admin", "user", "analyst"), allowNull: false },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "users" }
);
