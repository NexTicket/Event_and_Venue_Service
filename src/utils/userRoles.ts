// src/utils/userRoles.ts

import { getAuth } from 'firebase-admin/auth';

export async function setUserRole(uid: string, role: 'venue_owner' | 'customer' | 'admin') {
  try {
    await getAuth().setCustomUserClaims(uid, { role });
    console.log(`✅ Successfully set role "${role}" for user ${uid}`);
    
    // Verify the claims were set
    const user = await getAuth().getUser(uid);
    console.log('Custom claims:', user.customClaims);
    
    return { success: true, role };
  } catch (error) {
    console.error('❌ Error setting custom claims:', error);
    return { success: false, error };
  }
}

export async function getUserRole(uid: string): Promise<string> {
  try {
    const user = await getAuth().getUser(uid);
    return user.customClaims?.role || 'customer';
  } catch (error) {
    console.error('❌ Error getting user role:', error);
    return 'customer';
  }
}