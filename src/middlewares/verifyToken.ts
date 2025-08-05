// src/middlewares/verifyToken.mts

import { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app';
import { config } from 'dotenv';
config();

// ✅ initialize Firebase Admin only once and only if not in test environment
if (process.env.NODE_ENV !== 'test' && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // 🔑 Attach UID and custom claims (like role) to req.user
    req.user = {
      uid: decodedToken.uid,
      role: decodedToken.role || 'customer', // fallback
      email: decodedToken.email,
    };

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
