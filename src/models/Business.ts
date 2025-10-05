import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../db/sequelize.js";

export class Business extends Model<InferAttributes<Business>, InferCreationAttributes<Business>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare lithicAccountHolderToken: string;
}

Business.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    lithicAccountHolderToken: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: "businesses" }
);
