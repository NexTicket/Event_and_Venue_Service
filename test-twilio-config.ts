import dotenv from 'dotenv';
import { smsService } from './src/services/sms.service';

// Load environment variables
dotenv.config();

async function testTwilioConfig() {
    console.log('🧪 Testing Twilio Configuration...\n');
    
    // Check environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    console.log('Environment Variables:');
    console.log(`TWILIO_ACCOUNT_SID: ${accountSid ? '✅ Set' : '❌ Missing'}`);
    console.log(`TWILIO_AUTH_TOKEN: ${authToken ? '✅ Set' : '❌ Missing'}`);
    console.log(`TWILIO_API_KEY: ${apiKey ? '✅ Set' : '⚠️ Optional'}`);
    console.log(`TWILIO_API_SECRET: ${apiSecret ? '✅ Set' : '⚠️ Optional'}`);
    console.log(`TWILIO_PHONE_NUMBER: ${phoneNumber ? '✅ Set' : '❌ Missing'}\n`);
    
    // Test SMS service initialization
    if (accountSid && (authToken || (apiKey && apiSecret)) && phoneNumber) {
        console.log('✅ Twilio configuration looks good!');
        console.log('📱 SMS notifications will be sent when events are approved.');
        
        // Uncomment the lines below to send a test SMS (replace with your phone number)
        // const testResult = await smsService.sendEventApprovalNotification(
        //     '+1234567890', // Replace with your phone number
        //     'Test Event',
        //     'Test Venue'
        // );
        // console.log(`Test SMS result: ${testResult ? 'Success' : 'Failed'}`);
    } else {
        console.log('⚠️ Twilio configuration incomplete.');
        console.log('SMS notifications will be disabled.');
        console.log('\nTo enable SMS notifications, please set the following in your .env file:');
        console.log('- TWILIO_ACCOUNT_SID');
        console.log('- TWILIO_AUTH_TOKEN (or TWILIO_API_KEY + TWILIO_API_SECRET)');
        console.log('- TWILIO_PHONE_NUMBER');
    }
}

testTwilioConfig().catch(console.error);
