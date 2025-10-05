import { SpendingProfile } from "../models/SpendingProfile.js";

export class ProfilesService {
  constructor(private businessId: number) {}

  async listProfiles() {
    return SpendingProfile.findAll({ where: { businessId: this.businessId } });
  }

  async createProfile({ name, rules }: { name: string; rules: any }) {
    return SpendingProfile.create({ businessId: this.businessId, name, rules });
  }
}
