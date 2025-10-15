import twilio from 'twilio';

export interface SMSMessage {
    to: string;
    body: string;
}

export class SMSService {
    private client: any;
    private fromPhone: string;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const apiKey = process.env.TWILIO_API_KEY;
        const apiSecret = process.env.TWILIO_API_SECRET;
        this.fromPhone = process.env.TWILIO_PHONE_NUMBER || '';

        // Validate Twilio Account SID format
        if (accountSid && !accountSid.startsWith('AC') && !accountSid.includes('your_twilio_account_sid')) {
            console.warn('⚠️ Invalid Twilio Account SID format. Must start with "AC"');
            return;
        }

        if (accountSid && accountSid.includes('your_twilio_account_sid')) {
            console.warn('⚠️ Twilio credentials not configured - using placeholder values');
            return;
        }

        if (accountSid && (authToken || (apiKey && apiSecret))) {
            try {
                // Use API Key authentication if available, otherwise use Auth Token
                if (apiKey && apiSecret && !apiKey.includes('your_twilio_api_key')) {
                    this.client = twilio(apiKey, apiSecret, { accountSid });
                    console.log('✅ Twilio initialized with API Key authentication');
                } else if (authToken && !authToken.includes('your_twilio_auth_token')) {
                    this.client = twilio(accountSid, authToken);
                    console.log('✅ Twilio initialized with Auth Token authentication');
                } else {
                    console.warn('⚠️ Twilio credentials contain placeholder values');
                }
            } catch (error) {
                console.error('❌ Failed to initialize Twilio:', error instanceof Error ? error.message : 'Unknown error');
            }
        } else {
            console.warn('⚠️ Twilio credentials not found - SMS notifications disabled');
        }
    }

    public async sendSMS(message: SMSMessage): Promise<boolean> {
        if (!this.client || !this.fromPhone) {
            console.warn('⚠️ Twilio not configured - SMS not sent');
            return false;
        }

        try {
            await this.client.messages.create({
                body: message.body,
                from: this.fromPhone,
                to: message.to
            });
            console.log('✅ SMS sent successfully to:', message.to);
            return true;
        } catch (error) {
            console.error('❌ Failed to send SMS:', error);
            return false;
        }
    }

    public async sendEventApprovalNotification(
        phoneNumber: string, 
        eventTitle: string, 
        venueName?: string
    ): Promise<boolean> {
        const body = venueName 
            ? `Great news! Your event "${eventTitle}" has been approved and added to ${venueName}.`
            : `Great news! Your event "${eventTitle}" has been approved and added to your venue.`;

        return this.sendSMS({
            to: phoneNumber,
            body: body
        });
    }
}

export const smsService = new SMSService();
