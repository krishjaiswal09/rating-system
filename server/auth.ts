import bcrypt from 'bcrypt';
import session from 'express-session';
import { type RequestHandler } from 'express';

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user' | 'store_owner';
  };
}

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
