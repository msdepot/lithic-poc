import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../services/requireAuth.js";
import { UsersService } from "../../services/users.js";

export const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const svc = new UsersService(req.context.businessId);
  const users = await svc.listUsers();
  res.json(users);
});

const createSchema = z.object({ name: z.string().min(1), email: z.string().email(), role: z.enum(["owner","super_admin","admin","user","analyst"]) });
router.post("/", async (req, res) => {
  const body = createSchema.parse(req.body);
  const svc = new UsersService(req.context.businessId);
  const user = await svc.createUser(body);
  res.json(user);
});

export default router;
