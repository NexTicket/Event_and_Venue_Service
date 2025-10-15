import { jest } from '@jest/globals';

// Mock Twilio
jest.mock('twilio', () => {
    return jest.fn().mockImplementation(() => ({
        messages: {
            create: jest.fn().mockResolvedValue({
                sid: 'mock-message-sid',
                status: 'queued'
            })
        }
    }));
});

import { SMSService } from '../services/sms.service';

describe('SMS Service', () => {
    let smsService: SMSService;
    
    beforeEach(() => {
        // Set up environment variables for testing
        process.env.TWILIO_ACCOUNT_SID = 'test-sid';
        process.env.TWILIO_AUTH_TOKEN = 'test-token';
        process.env.TWILIO_PHONE_NUMBER = '+1234567890';
        
        smsService = new SMSService();
    });

    afterEach(() => {
        jest.clearAllMocks();
        // Clean up environment variables
        delete process.env.TWILIO_ACCOUNT_SID;
        delete process.env.TWILIO_AUTH_TOKEN;
        delete process.env.TWILIO_PHONE_NUMBER;
    });

    it('should send SMS successfully', async () => {
        const result = await smsService.sendSMS({
            to: '+1987654321',
            body: 'Test message'
        });

        expect(result).toBe(true);
    });

    it('should send event approval notification', async () => {
        const result = await smsService.sendEventApprovalNotification(
            '+1987654321',
            'Concert Night',
            'Madison Square Garden'
        );

        expect(result).toBe(true);
    });

    it('should handle missing Twilio configuration gracefully', async () => {
        // Remove environment variables
        delete process.env.TWILIO_ACCOUNT_SID;
        delete process.env.TWILIO_AUTH_TOKEN;
        delete process.env.TWILIO_PHONE_NUMBER;
        
        const unconfiguredService = new SMSService();
        const result = await unconfiguredService.sendSMS({
            to: '+1987654321',
            body: 'Test message'
        });

        expect(result).toBe(false);
    });
});
