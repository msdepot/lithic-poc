import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../db/sequelize.js";

export class Card extends Model<InferAttributes<Card>, InferCreationAttributes<Card>> {
  declare id: CreationOptional<number>;
  declare businessId: number;
  declare userId: number;
  declare type: "debit" | "prepaid";
  declare profileId: number | null;
  declare lithicCardToken: string;
}

Card.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM("debit", "prepaid"), allowNull: false },
    profileId: { type: DataTypes.INTEGER, allowNull: true },
    lithicCardToken: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: "cards" }
);
