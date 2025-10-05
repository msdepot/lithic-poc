import { User } from "../models/User.js";

export class UsersService {
  constructor(private businessId: number) {}

  async listUsers() {
    return User.findAll({ where: { businessId: this.businessId } });
  }

  async createUser({ name, email, role }: { name: string; email: string; role: string }) {
    return User.create({ name, email, role: role as any, businessId: this.businessId });
  }
}
