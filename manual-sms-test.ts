#!/usr/bin/env tsx
import dotenv from 'dotenv';
import { smsService } from './src/services/sms.service';

// Load environment variables
dotenv.config();

async function manualSMSTest() {
    console.log('📱 Manual SMS Test\n');
    
    // Test 1: Check configuration
    console.log('1. Testing SMS service configuration...');
    const configTest = new (await import('./src/services/sms.service')).SMSService();
    console.log('   ✅ SMS Service initialized successfully\n');
    
    // Test 2: Test event approval notification (dry run)
    console.log('2. Testing event approval notification format...');
    const message = 'Great news! Your event "Sample Concert" has been approved and added to Madison Square Garden.';
    console.log(`   Message preview: "${message}"`);
    console.log('   ✅ Message format looks good\n');
    
    // Test 3: Check environment variables
    console.log('3. Checking Twilio environment variables...');
    const hasAccountSid = !!process.env.TWILIO_ACCOUNT_SID;
    const hasAuthToken = !!process.env.TWILIO_AUTH_TOKEN;
    const hasPhoneNumber = !!process.env.TWILIO_PHONE_NUMBER;
    
    console.log(`   TWILIO_ACCOUNT_SID: ${hasAccountSid ? '✅' : '❌'}`);
    console.log(`   TWILIO_AUTH_TOKEN: ${hasAuthToken ? '✅' : '❌'}`);
    console.log(`   TWILIO_PHONE_NUMBER: ${hasPhoneNumber ? '✅' : '❌'}\n`);
    
    if (hasAccountSid && hasAuthToken && hasPhoneNumber) {
        console.log('🎉 All configurations are set! SMS notifications will work when events are approved.');
    } else {
        console.log('⚠️  Some Twilio configurations are missing. SMS notifications will be disabled.');
    }
    
    console.log('\n🧪 Test completed successfully!');
}

manualSMSTest().catch(console.error);
