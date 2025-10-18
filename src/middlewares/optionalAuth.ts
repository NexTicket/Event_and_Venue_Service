// src/middlewares/optionalAuth.ts

import { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Check if user info was already set by API Gateway (via X-User-* headers)
  const userIdHeader = req.headers['x-user-id'] as string;
  const userEmailHeader = req.headers['x-user-email'] as string;
  const userRoleHeader = req.headers['x-user-role'] as string;
  
  if (userIdHeader && userEmailHeader) {
    // User was authenticated by API Gateway
    req.user = {
      uid: userIdHeader,
      email: userEmailHeader,
      role: userRoleHeader || 'customer', // Use role from gateway or default to customer
    };
    console.log('👤 User authenticated by API Gateway:', req.user);
    return next();
  }

  // If no auth header, continue without setting req.user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('👤 No authentication provided - continuing as public request');
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Check for custom claims first
    let userRole = decodedToken.role;
    
    // TEMPORARY FIX: Check if user is admin by email until custom claims are properly set
    const adminEmails = [
      'admin@nexticket.com', 
      'admin@company.com',
      'admin@test.com',
      'test@admin.com',
      'hello@Hi.com'
    ];
    
    const isAdminEmail = decodedToken.email && (
      adminEmails.includes(decodedToken.email.toLowerCase()) ||
      decodedToken.email.toLowerCase().includes('admin') ||
      process.env.NODE_ENV === 'development'
    );
    
    if (!userRole && isAdminEmail) {
      userRole = 'admin';
    }
    
    if (!userRole) {
      userRole = 'customer'; // fallback
    }
    
    // Attach user info to req.user
    req.user = {
      uid: decodedToken.uid,
      role: userRole,
      email: decodedToken.email,
    };
    
    console.log('👤 Authenticated user:', req.user);
    next();
  } catch (err) {
    // If token is invalid, continue as public request instead of throwing error
    console.log('⚠️ Invalid token provided - continuing as public request:', (err as Error).message || err);
    next();
  }
};
