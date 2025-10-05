import { Router } from "express";
import { z } from "zod";
import { AuthService } from "../../services/auth.js";

export const router = Router();

const loginSchema = z.object({ email: z.string().email(), role: z.enum(["crm","business"]) });

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const auth = new AuthService();
  const token = await auth.login(parse.data);
  res.json({ token });
});

export default router;
