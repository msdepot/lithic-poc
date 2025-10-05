import { Router } from "express";
import { router as crmRouter } from "./v1/crm.js";
import { router as authRouter } from "./v1/auth.js";
import { router as usersRouter } from "./v1/users.js";
import { router as cardsRouter } from "./v1/cards.js";
import { router as profilesRouter } from "./v1/profiles.js";

export const router = Router();
router.use("/v1/crm", crmRouter);
router.use("/v1/auth", authRouter);
router.use("/v1/users", usersRouter);
router.use("/v1/cards", cardsRouter);
router.use("/v1/profiles", profilesRouter);
