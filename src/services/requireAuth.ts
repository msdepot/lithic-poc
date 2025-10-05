import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      context: { userId: number; businessId: number; role: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "missing auth" });
  const token = auth.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.context = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
}
