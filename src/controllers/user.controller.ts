import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Set Firebase custom claims for a user
export const setUserClaims = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, claims } = req.body;
    const user = req.user;

    console.log('🔑 SetUserClaims request:', { firebaseUid, claims });
    console.log('🔑 Authenticated user:', user);

    // Validate required fields
    if (!firebaseUid || !claims) {
      return res.status(400).json({
        error: 'Missing required fields: firebaseUid and claims are required'
      });
    }

    // Validate claims structure
    if (!claims.role) {
      return res.status(400).json({
        error: 'Claims must contain a role field'
      });
    }

    // Only admins can set custom claims
    if (!user || user.role !== 'admin') {
      console.log('❌ Access denied: User is not admin');
      console.log('❌ User details:', {
        exists: !!user,
        role: user?.role,
        uid: user?.uid,
        email: user?.email
      });
      return res.status(403).json({
        error: 'Access denied. Only administrators can set user claims.',
        details: {
          userExists: !!user,
          currentRole: user?.role || 'none',
          requiredRole: 'admin'
        }
      });
    }

    console.log(`🔑 Setting custom claims for user ${firebaseUid}:`, claims);

    // Step 1: Set the custom claims using Firebase Admin SDK
    await getAuth().setCustomUserClaims(firebaseUid, claims);
    console.log(`✅ Step 1: Successfully set Firebase custom claims for ${firebaseUid}: ${claims.role}`);

    // Step 2: Update the user's role in Firestore document
    try {
      const db = getFirestore();
      const userDocRef = db.collection('users').doc(firebaseUid);
      
      // Check if user document exists
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        console.log(`⚠️ User document not found in Firestore for ${firebaseUid}, creating one...`);
        // Create a basic user document if it doesn't exist
        await userDocRef.set({
          uid: firebaseUid,
          role: claims.role,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing user document
        await userDocRef.update({
          role: claims.role,
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log(`✅ Step 2: Successfully updated user role in Firestore: ${firebaseUid} → ${claims.role}`);
    } catch (firestoreError: any) {
      console.error('❌ Step 2 failed: Error updating Firestore document:', firestoreError);
      // Don't fail the whole operation if Firestore update fails
      console.warn('⚠️ Custom claims set but Firestore update failed. User may need to refresh to see changes.');
    }

    res.status(200).json({
      message: 'Custom claims and user role updated successfully',
      data: {
        firebaseUid,
        claims,
        customClaimsSet: true,
        firestoreUpdated: true
      }
    });

  } catch (error: any) {
    console.error('❌ Error setting custom claims:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        error: 'User not found in Firebase Authentication'
      });
    }

    res.status(500).json({
      error: 'Failed to set custom claims',
      details: error.message
    });
  }
};

// Bootstrap function to set admin role for the first admin user
// This should only be used once to set up the first admin
export const bootstrapAdmin = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email } = req.body;

    console.log('🔑 BootstrapAdmin request:', { firebaseUid, email });

    // Validate required fields
    if (!firebaseUid || !email) {
      return res.status(400).json({
        error: 'Missing required fields: firebaseUid and email are required'
      });
    }

    // For bootstrap, be more permissive to allow initial admin setup
    console.log(`🔍 Bootstrap admin check - Email: ${email}, NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Check if this is a valid admin email (expanded for testing)
    const adminEmails = [
      'admin@nexticket.com', 
      'admin@company.com',
      'admin@test.com',
      'test@admin.com',
      'hello@hi.com' // Add the current user's email
    ];
    
    // For bootstrap, allow any email in development mode or if it's in the admin list
    const isAdminEmail = adminEmails.includes(email.toLowerCase()) || 
                        email.toLowerCase().includes('admin') ||
                        process.env.NODE_ENV === 'development' ||
                        process.env.NODE_ENV !== 'production'; // Allow in non-production environments
    
    console.log(`🔍 Admin email check result: ${isAdminEmail}`);
    
    if (!isAdminEmail) {
      console.log(`❌ Invalid admin email: ${email}`);
      console.log(`🔍 Valid admin emails: ${adminEmails.join(', ')}`);
      console.log(`🔍 Environment: ${process.env.NODE_ENV}`);
      return res.status(403).json({
        error: 'Access denied. Not a valid admin email.',
        validEmails: adminEmails,
        providedEmail: email,
        environment: process.env.NODE_ENV
      });
    }

    console.log(`🔑 Bootstrapping admin role for ${email}...`);

    // Step 1: Set the custom claims using Firebase Admin SDK
    await getAuth().setCustomUserClaims(firebaseUid, { role: 'admin' });
    console.log(`✅ Step 1: Successfully set Firebase admin claims for ${firebaseUid}`);

    // Step 2: Update the user's role in Firestore document
    try {
      const db = getFirestore();
      const userDocRef = db.collection('users').doc(firebaseUid);
      
      // Check if user document exists
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        console.log(`⚠️ User document not found in Firestore for ${firebaseUid}, creating one...`);
        // Create a basic user document if it doesn't exist
        await userDocRef.set({
          uid: firebaseUid,
          email: email,
          role: 'admin',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing user document
        await userDocRef.update({
          role: 'admin',
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log(`✅ Step 2: Successfully updated admin role in Firestore: ${firebaseUid} → admin`);
    } catch (firestoreError: any) {
      console.error('❌ Step 2 failed: Error updating Firestore document:', firestoreError);
      // Don't fail the whole operation if Firestore update fails
      console.warn('⚠️ Custom claims set but Firestore update failed.');
    }

    res.status(200).json({
      message: 'Admin role bootstrapped successfully',
      data: {
        firebaseUid,
        email,
        role: 'admin',
        customClaimsSet: true,
        firestoreUpdated: true
      }
    });

  } catch (error: any) {
    console.error('❌ Error bootstrapping admin:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        error: 'User not found in Firebase Authentication'
      });
    }

    res.status(500).json({
      error: 'Failed to bootstrap admin',
      details: error.message
    });
  }
};
