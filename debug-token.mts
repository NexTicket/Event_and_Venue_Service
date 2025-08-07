// debug-token.mts - Debug what's in the current token

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

config();

async function main() {
  try {
    console.log('🔍 Checking Firebase service account...');
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
      return;
    }
    
    console.log('✅ Firebase service account key found');
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
    console.log('✅ Service account parsed successfully');
    
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
    
    const uid = 'ML65KXU2ckgHfbQuFx1xErB39v83';
    console.log(`🔍 Getting user info for UID: ${uid}`);
    
    const user = await getAuth().getUser(uid);
    console.log('📋 Current user custom claims:', user.customClaims);
    
    console.log('🔧 Setting custom claims...');
    await getAuth().setCustomUserClaims(uid, { role: 'venue_owner' });
    console.log('✅ Custom claims set successfully');
    
    // Verify
    const updatedUser = await getAuth().getUser(uid);
    console.log('📋 Updated user custom claims:', updatedUser.customClaims);
    
    console.log('\n⚠️  IMPORTANT: The user must sign out and sign back in on the frontend to get a new token with these claims!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

main();
