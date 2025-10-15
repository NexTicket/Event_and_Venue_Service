import { SMSService } from '../src/services/sms.service';

describe('SMS Service Integration', () => {
    beforeEach(() => {
        // Clear any existing environment variables
        delete process.env.TWILIO_ACCOUNT_SID;
        delete process.env.TWILIO_AUTH_TOKEN;
        delete process.env.TWILIO_PHONE_NUMBER;
    });

    it('should initialize without Twilio credentials and handle gracefully', () => {
        const service = new SMSService();
        expect(service).toBeDefined();
    });

    it('should initialize with Twilio credentials', () => {
        process.env.TWILIO_ACCOUNT_SID = 'test-sid';
        process.env.TWILIO_AUTH_TOKEN = 'test-token';
        process.env.TWILIO_PHONE_NUMBER = '+1234567890';
        
        const service = new SMSService();
        expect(service).toBeDefined();
    });

    it('should handle missing phone number gracefully', async () => {
        const service = new SMSService();
        const result = await service.sendEventApprovalNotification(
            '', // empty phone number
            'Test Event',
            'Test Venue'
        );
        expect(result).toBe(false);
    });
});
