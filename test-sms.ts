import { smsService } from './src/services/sms.service';

// Simple test script to verify SMS service configuration
async function testSMSService() {
    console.log('🧪 Testing SMS Service Configuration...');
    
    // This will not actually send an SMS but will check configuration
    const testPhone = '+1234567890'; // Replace with a test phone number
    const result = await smsService.sendEventApprovalNotification(
        testPhone,
        'Test Event',
        'Test Venue'
    );
    
    if (result) {
        console.log('✅ SMS service is properly configured');
    } else {
        console.log('⚠️ SMS service is not configured or failed to send');
    }
}

// Uncomment the line below to run the test
// testSMSService();
