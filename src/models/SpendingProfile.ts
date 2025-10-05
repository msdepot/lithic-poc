import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../db/sequelize.js";

export class SpendingProfile extends Model<InferAttributes<SpendingProfile>, InferCreationAttributes<SpendingProfile>> {
  declare id: CreationOptional<number>;
  declare businessId: number;
  declare name: string;
  declare rules: any;
}

SpendingProfile.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    rules: { type: DataTypes.JSONB, allowNull: false },
  },
  { sequelize, tableName: "spending_profiles" }
);
