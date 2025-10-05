import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Business } from "../models/Business.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export class AuthService {
  async login({ email, role }: { email: string; role: "crm" | "business" }) {
    if (role === "crm") {
      if (email !== "admin@admin.com") throw new Error("invalid CRM login");
      return jwt.sign({ userId: 0, businessId: 0, role: "crm" }, JWT_SECRET, { expiresIn: "12h" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("user not found");
    const business = await Business.findByPk(user.businessId);
    if (!business) throw new Error("business not found");
    return jwt.sign({ userId: user.id, businessId: user.businessId, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
  }
}
