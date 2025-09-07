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
    
    // 🔑 Check for custom claims first - they are directly accessible on decodedToken
    let userRole = decodedToken.role; // No await needed - custom claims are synchronously available
    
    // TEMPORARY FIX: Check if user is admin by email until custom claims are properly set
    const adminEmails = [
      'admin@nexticket.com', 
      'admin@company.com',
      'admin@test.com',
      'test@admin.com',
      'hello@Hi.com'
    ];
    
    // Check admin email or development mode
    const isAdminEmail = decodedToken.email && (
      adminEmails.includes(decodedToken.email.toLowerCase()) ||
      decodedToken.email.toLowerCase().includes('admin') ||
      process.env.NODE_ENV === 'development'
    );
    
    if (!userRole && isAdminEmail) {
      userRole = 'admin';
      console.log(`⚡ TEMPORARY: Admin detected by email (${decodedToken.email}), overriding role to admin`);
    }
    
    // If no custom claims role, we could fetch from database here
    // For now, let's check the custom claims
    if (!userRole) {
      console.log('⚠️ No role in custom claims, using default. Set custom claims with Firebase Admin SDK.');
      console.log('📋 Available custom claims on token:', {
        role: decodedToken.role,
        uid: decodedToken.uid,
        email: decodedToken.email,
        iat: new Date(decodedToken.iat * 1000).toISOString(),
        exp: new Date(decodedToken.exp * 1000).toISOString(),
        customClaims: decodedToken
      });
      userRole = 'customer'; // fallback
    } else {
      console.log(`✅ Found role in custom claims: ${userRole}`);
    }
    
    // 🔑 Attach UID and role to req.user
    req.user = {
      uid: decodedToken.uid,
      role: userRole,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.display_name || null,
    };
    console.log('🔍 Decoded Token custom claims:', { role: decodedToken.role, uid: decodedToken.uid });
    console.log('� Full decoded token for debugging:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role,
      iat: new Date(decodedToken.iat * 1000).toISOString(),
      exp: new Date(decodedToken.exp * 1000).toISOString(),
      hasCustomClaims: !!decodedToken.role,
      allCustomClaims: Object.keys(decodedToken).filter(key => !['iss', 'aud', 'auth_time', 'user_id', 'sub', 'iat', 'exp', 'email', 'email_verified', 'firebase', 'uid'].includes(key))
    });
    console.log('�👤 Resolved User:', req.user);

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
