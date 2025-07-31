export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text' | 'image' | 'document' | 'template';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  image?: {
    id?: string;
    link?: string;
    caption?: string;
  };
  document?: {
    id?: string;
    link?: string;
    filename?: string;
    caption?: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: 'header' | 'body' | 'button';
      parameters?: Array<{
        type: 'text' | 'image' | 'document' | 'video' | 'audio' | 'location' | 'contact';
        text?: string;
        image?: {
          link: string;
        };
        document?: {
          link: string;
          filename: string;
        };
      }>;
    }>;
  };
}

export interface WhatsAppResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface BusinessProfile {
  messaging_product: 'whatsapp';
  display_phone_number: string;
  phone_number_id: string;
  about: string;
  address: string;
  description: string;
  email: string;
  websites: string[];
  vertical: string;
}

export class WhatsAppBusinessAPI {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(accessToken: string, phoneNumberId: string, businessAccountId?: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.businessAccountId = businessAccountId || '';
  }

  /**
   * Send a message via WhatsApp Business API
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, text: string, previewUrl?: boolean): Promise<WhatsAppResponse> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body: text,
        preview_url: previewUrl,
      },
    };

    return this.sendMessage(message);
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    languageCode: string = 'en_US',
    components?: WhatsAppMessage['template']['components']
  ): Promise<WhatsAppResponse> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components,
      },
    };

    return this.sendMessage(message);
  }

  /**
   * Get business profile information
   */
  async getBusinessProfile(): Promise<BusinessProfile> {
    const url = `${this.baseUrl}/${this.phoneNumberId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Verify webhook challenge
   */
  async verifyWebhook(mode: string, challenge: string, verifyToken: string): Promise<string> {
    if (mode === 'subscribe' && challenge) {
      // Verify the webhook
      const url = `${this.baseUrl}/${this.phoneNumberId}/subscribed_apps`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: this.accessToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify webhook');
      }

      return challenge;
    }

    throw new Error('Invalid webhook verification parameters');
  }

  /**
   * Test connection by getting business profile
   */
  async testConnection(): Promise<{ isConnected: boolean; profile?: BusinessProfile; error?: string }> {
    try {
      const profile = await this.getBusinessProfile();
      return {
        isConnected: true,
        profile,
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get phone numbers associated with the business account
   */
  async getPhoneNumbers(): Promise<Array<{
    id: string;
    display_phone_number: string;
    phone_number: string;
    quality_rating: string;
    verified_name: string;
  }>> {
    if (!this.businessAccountId) {
      throw new Error('Business Account ID is required to get phone numbers');
    }

    const url = `${this.baseUrl}/${this.businessAccountId}/phone_numbers`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data || [];
  }
}

/**
 * Utility functions for WhatsApp Business API
 */
export class WhatsAppUtils {
  /**
   * Format phone number for WhatsApp API
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    // Add country code if not present (assuming Indonesia +62)
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return /^62\d{9,15}$/.test(formatted);
  }

  /**
   * Parse webhook payload
   */
  static parseWebhookPayload(payload: any): {
    object: string;
    entry: Array<{
      id: string;
      changes: Array<{
        value: {
          messaging_product: string;
          metadata: {
            display_phone_number: string;
            phone_number_id: string;
          };
          contacts?: Array<{
            profile: {
              name: string;
            };
            wa_id: string;
          }>;
          messages?: Array<{
            from: string;
            id: string;
            timestamp: string;
            type: string;
            text?: {
              body: string;
            };
            image?: {
              id: string;
              mime_type: string;
              sha256: string;
            };
            document?: {
              id: string;
              filename: string;
              mime_type: string;
            };
          }>;
          statuses?: Array<{
            id: string;
            status: 'sent' | 'delivered' | 'read' | 'failed';
            timestamp: string;
            recipient_id: string;
          }>;
        };
        field: string;
      }>;
    }>;
  } {
    return payload;
  }
} 