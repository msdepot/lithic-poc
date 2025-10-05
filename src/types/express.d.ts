import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    context: { userId: number; businessId: number; role: string };
  }
}
