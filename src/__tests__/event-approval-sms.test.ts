import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the SMS service to avoid sending actual SMS during tests
jest.mock('../services/sms.service', () => ({
    smsService: {
        sendEventApprovalNotification: jest.fn().mockResolvedValue(true)
    }
}));

import { smsService } from '../services/sms.service';

describe('Event Approval with SMS Notification', () => {
    const mockSMSService = smsService as jest.Mocked<typeof smsService>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send SMS notification when event is approved', async () => {
        // This is a basic test structure - you'll need to adjust based on your auth setup
        const mockAuthToken = 'mock-admin-token';
        const eventId = 1;
        
        const response = await request(app)
            .post(`/api/events/${eventId}/approve`)
            .set('Authorization', `Bearer ${mockAuthToken}`)
            .send({
                venueId: 1,
                eventAdminUid: 'admin-uid',
                checkinOfficerUids: ['officer-uid-1']
            });

        // Verify that SMS service was called
        expect(mockSMSService.sendEventApprovalNotification).toHaveBeenCalledWith(
            expect.any(String), // phone number
            expect.any(String), // event title
            expect.any(String)  // venue name
        );
    });

    it('should not fail if SMS service fails', async () => {
        // Mock SMS service to fail
        mockSMSService.sendEventApprovalNotification.mockRejectedValue(new Error('SMS failed'));
        
        const mockAuthToken = 'mock-admin-token';
        const eventId = 1;
        
        const response = await request(app)
            .post(`/api/events/${eventId}/approve`)
            .set('Authorization', `Bearer ${mockAuthToken}`)
            .send({
                venueId: 1,
                eventAdminUid: 'admin-uid',
                checkinOfficerUids: ['officer-uid-1']
            });

        // Event approval should still succeed even if SMS fails
        // Adjust the expected status code based on your implementation
        expect(response.status).toBe(200);
    });
});
