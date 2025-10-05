import { Business } from "../models/Business.js";
import { User } from "../models/User.js";
import { Lithic } from "../modules/lithic/client.js";

export class OnboardingService {
  lithic = new Lithic();

  async onboardBusiness({ businessName, ownerEmail, ownerName }: { businessName: string; ownerEmail: string; ownerName: string }) {
    const t = await Business.sequelize!.transaction();
    try {
      const holder = await this.lithic.createAccountHolder({
        type: "BUSINESS",
        business_name: businessName,
      });
      const business = await Business.create({ name: businessName, lithicAccountHolderToken: holder.token }, { transaction: t });
      const owner = await User.create({ name: ownerName, email: ownerEmail, role: "owner", businessId: business.id }, { transaction: t });
      await t.commit();
      return { business, owner, lithic: holder };
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }
}
