import axios from "axios";

const LITHIC_API = process.env.LITHIC_API || "https://sandbox.lithic.com";
const LITHIC_KEY = process.env.LITHIC_API_KEY || "";

type CreateAccountHolderInput = {
  type: "BUSINESS" | "INDIVIDUAL";
  business_name?: string;
  phone_number?: string;
};

type CreateCardInput = { type: "debit" | "prepaid" };

export class Lithic {
  client = axios.create({
    baseURL: `${LITHIC_API}/v1`,
    headers: { Authorization: `Bearer ${LITHIC_KEY}` },
  });

  private get useStub(): boolean {
    return !LITHIC_KEY;
  }

  async createAccountHolder(payload: CreateAccountHolderInput) {
    if (this.useStub) {
      return { token: `stub_holder_${Date.now()}`, ...payload };
    }
    const res = await this.client.post("/account_holders", payload);
    return res.data;
  }

  async createCard(payload: CreateCardInput) {
    if (this.useStub) {
      return { token: `stub_card_${payload.type}_${Date.now()}`, status: "OPEN" };
    }
    const res = await this.client.post("/cards", {
      type: payload.type === "debit" ? "DEBIT" : "PREPAID",
    });
    return res.data;
  }
}
