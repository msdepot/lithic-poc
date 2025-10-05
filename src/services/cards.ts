import { Card } from "../models/Card.js";
import { Lithic } from "../modules/lithic/client.js";

export class CardsService {
  lithic = new Lithic();
  constructor(private businessId: number) {}

  async listCards() {
    return Card.findAll({ where: { businessId: this.businessId } });
  }

  async createCard({ userId, type, profileId }: { userId: number; type: "debit" | "prepaid"; profileId?: number }) {
    const lithicCard = await this.lithic.createCard({ type });
    const card = await Card.create({ userId, businessId: this.businessId, type, profileId: profileId ?? null, lithicCardToken: lithicCard.token });
    return card;
  }
}
