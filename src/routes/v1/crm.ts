import { Router } from "express";
import { z } from "zod";
import { OnboardingService } from "../../services/onboarding.js";

export const router = Router();

const onboardSchema = z.object({
  businessName: z.string().min(1),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(1),
});

router.post("/onboard", async (req, res) => {
  const parse = onboardSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const svc = new OnboardingService();
    const result = await svc.onboardBusiness(parse.data);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "failed to onboard" });
  }
});

export default router;
