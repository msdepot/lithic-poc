import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../services/requireAuth.js";
import { CardsService } from "../../services/cards.js";

export const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const svc = new CardsService(req.context.businessId);
  res.json(await svc.listCards());
});

const createSchema = z.object({ userId: z.number(), type: z.enum(["debit","prepaid"]), profileId: z.number().optional() });
router.post("/", async (req, res) => {
  const svc = new CardsService(req.context.businessId);
  const card = await svc.createCard(createSchema.parse(req.body));
  res.json(card);
});

export default router;
