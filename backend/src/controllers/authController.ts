import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Credentials admin (en production: stocker en DB avec hash)
const ADMIN_USERNAME = process.env['ADMIN_USERNAME'] || 'admin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(
  process.env['ADMIN_PASSWORD'] || 'admin123',
  10
);

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Identifiants manquants' });
      return;
    }

    if (username !== ADMIN_USERNAME) {
      res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      return;
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      return;
    }

    const secret = process.env['JWT_SECRET'] || 'secret';
    const expiresIn = process.env['JWT_EXPIRES_IN'] || '24h';
    const token = jwt.sign({ username }, secret, { expiresIn } as jwt.SignOptions);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      admin: { username },
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const verifySession = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Session valide' });
};
