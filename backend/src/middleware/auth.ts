import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: { username: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ success: false, message: 'Token manquant. Accès refusé.' });
    return;
  }

  try {
    const secret = process.env['JWT_SECRET'] || 'secret';
    const decoded = jwt.verify(token, secret) as { username: string };
    req.admin = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Token invalide ou expiré.' });
  }
};
