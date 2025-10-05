import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../services/requireAuth.js";
import { ProfilesService } from "../../services/profiles.js";

export const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const svc = new ProfilesService(req.context.businessId);
  res.json(await svc.listProfiles());
});

const createSchema = z.object({ name: z.string().min(1),
  rules: z.object({
    maxTransactionAmount: z.number().int().positive().optional(),
    dailyLimitAmount: z.number().int().positive().optional(),
    merchantCategoryAllow: z.array(z.string()).optional(),
    merchantCategoryDeny: z.array(z.string()).optional(),
  })
});
router.post("/", async (req, res) => {
  const svc = new ProfilesService(req.context.businessId);
  const profile = await svc.createProfile(createSchema.parse(req.body));
  res.json(profile);
});

export default router;
