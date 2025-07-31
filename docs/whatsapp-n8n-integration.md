# WhatsApp Business API Integration with n8n

## Overview

This document describes the implementation of WhatsApp Business API integration with n8n workflow automation. The system allows users to store their WhatsApp credentials securely and send them to n8n for automated message handling.

## Features

### 1. Secure Credential Storage
- **Encrypted Storage**: All WhatsApp credentials are encrypted using AES-256-GCM before storing in the database
- **Per-User Credentials**: Each user can have their own set of WhatsApp Business API credentials
- **Field Encryption**: The following fields are encrypted:
  - `whatsappClientId`
  - `whatsappClientSecret`
  - `whatsappAccessToken`
  - `whatsappBusinessAccountId`
  - `whatsappPhoneNumberId`

### 2. User Interface
- **Settings Page**: Users can configure their WhatsApp credentials in the settings page
- **Credential Management**: Separate sections for new WhatsApp credentials and legacy configuration
- **Connection Testing**: Users can test their WhatsApp API connection
- **n8n Integration**: Button to send credentials to n8n workflow

### 3. n8n Integration
- **Webhook Endpoint**: Dedicated API endpoint to send credentials to n8n
- **tRPC Procedure**: Server-side procedure for sending credentials
- **Payload Structure**: Structured data sent to n8n with user and credential information

## Database Schema

### User Model Updates

```typescript
interface IUser extends Document {
  // ... existing fields
  // WhatsApp Business API Credentials (encrypted)
  whatsappClientId?: string;
  whatsappClientSecret?: string;
  whatsappAccessToken?: string;
  whatsappBusinessAccountId?: string;
  whatsappPhoneNumberId?: string;
  // ... other fields
}
```

## API Endpoints

### 1. tRPC Procedures

#### `auth.updateProfile`
- **Purpose**: Update user profile including WhatsApp credentials
- **Input**: 
  ```typescript
  {
    whatsappClientId?: string;
    whatsappClientSecret?: string;
    whatsappAccessToken?: string;
    whatsappBusinessAccountId?: string;
    whatsappPhoneNumberId?: string;
  }
  ```
- **Encryption**: All sensitive fields are encrypted before storage

#### `whatsapp.sendCredentialsToN8n`
- **Purpose**: Send user's WhatsApp credentials to n8n
- **Process**:
  1. Retrieve user's encrypted credentials
  2. Decrypt credentials
  3. Validate all required fields are present
  4. Send to n8n webhook
  5. Return success/error response

### 2. REST API Endpoints

#### `POST /api/n8n/webhook`
- **Purpose**: Alternative endpoint for sending credentials to n8n
- **Authentication**: Requires user session
- **Payload**: Structured data with user and credential information

## Frontend Components

### WhatsAppSettings Component

#### Features
- **Credential Input**: Form fields for all WhatsApp credentials
- **Legacy Support**: Backward compatibility with old credential format
- **Connection Testing**: Test WhatsApp API connection
- **n8n Integration**: Send credentials to n8n workflow

#### State Management
```typescript
interface WhatsAppSettings {
  // WhatsApp Business API Credentials
  whatsappClientId: string;
  whatsappClientSecret: string;
  whatsappAccessToken: string;
  whatsappBusinessAccountId: string;
  whatsappPhoneNumberId: string;
  // Legacy fields (for backward compatibility)
  metaAccessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl: string;
  autoReplyMessage: string;
}
```

## n8n Integration Details

### Webhook URL
```
https://primary-production-9778.up.railway.app/webhook-test/2c73b5be-5924-44a4-942c-55c2d1836d77
```

### Payload Structure
```json
{
  "userId": "user_id_string",
  "userEmail": "user@example.com",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "whatsappCredentials": {
    "clientId": "encrypted_client_id",
    "clientSecret": "encrypted_client_secret",
    "accessToken": "encrypted_access_token",
    "businessAccountId": "encrypted_business_account_id",
    "phoneNumberId": "encrypted_phone_number_id"
  },
  "metadata": {
    "source": "layanify-crm",
    "version": "1.0.0",
    "action": "whatsapp_credentials_update"
  }
}
```

### n8n Workflow Expected Behavior

1. **Trigger**: Receives webhook with user credentials
2. **WhatsApp Node**: Uses provided credentials to connect to WhatsApp Business API
3. **Message Processing**: 
   - Receives incoming WhatsApp messages
   - Saves conversations to MongoDB
   - Forwards questions to AI agent
   - Sends AI agent's response back to WhatsApp

## Security Considerations

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Management**: Environment variable `ENCRYPTION_KEY`
- **IV**: 96-bit random IV for each encryption
- **Storage**: Encrypted data stored in MongoDB

### Access Control
- **Authentication**: All endpoints require user authentication
- **Authorization**: Users can only access their own credentials
- **Session Management**: NextAuth.js handles session validation

### Data Protection
- **Sensitive Fields**: All credential fields are encrypted
- **Error Handling**: Graceful handling of decryption failures
- **Logging**: Minimal logging of sensitive operations

## Usage Flow

### 1. User Configuration
1. User navigates to Settings > WhatsApp
2. Enters WhatsApp Business API credentials
3. Saves configuration (credentials are encrypted and stored)
4. Tests connection to verify credentials

### 2. n8n Integration
1. User clicks "Send to n8n" button
2. System retrieves and decrypts user credentials
3. Credentials are sent to n8n webhook
4. n8n receives credentials and configures WhatsApp node
5. Workflow is ready to process incoming messages

### 3. Message Processing
1. WhatsApp message arrives at n8n
2. n8n uses stored credentials to process message
3. Message is saved to MongoDB
4. Question is forwarded to AI agent
5. AI response is sent back to WhatsApp

## Error Handling

### Common Errors
- **Missing Credentials**: User hasn't configured all required fields
- **Invalid Credentials**: WhatsApp API connection fails
- **n8n Connection**: Failed to send credentials to n8n
- **Decryption Error**: Corrupted or invalid encrypted data

### Error Responses
- **400 Bad Request**: Missing or invalid credentials
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server-side processing error

## Testing

### Manual Testing
1. Configure WhatsApp credentials in settings
2. Test connection to verify credentials
3. Send credentials to n8n
4. Verify n8n receives and processes credentials
5. Test end-to-end message flow

### Automated Testing
- Unit tests for encryption/decryption
- Integration tests for tRPC procedures
- E2E tests for settings page functionality

## Future Enhancements

### Planned Features
- **Credential Rotation**: Automatic credential refresh
- **Multiple Accounts**: Support for multiple WhatsApp accounts per user
- **Webhook Management**: Dynamic webhook URL configuration
- **Analytics**: Track message processing and response times
- **Template Management**: WhatsApp message templates
- **Media Support**: Image, document, and video message handling

### Security Improvements
- **Key Rotation**: Periodic encryption key updates
- **Audit Logging**: Comprehensive audit trail
- **Rate Limiting**: API rate limiting for credential operations
- **IP Whitelisting**: Restrict n8n webhook access

## Troubleshooting

### Common Issues

#### Connection Test Fails
- Verify all credential fields are filled
- Check credential validity with Meta
- Ensure proper API permissions

#### n8n Integration Fails
- Verify webhook URL is accessible
- Check network connectivity
- Review n8n webhook configuration

#### Encryption Errors
- Verify `ENCRYPTION_KEY` environment variable
- Check key length (must be 32 characters)
- Review database connection

### Debug Steps
1. Check browser console for frontend errors
2. Review server logs for backend errors
3. Verify database connection and data integrity
4. Test n8n webhook endpoint directly
5. Validate credential format and permissions

## Configuration

### Environment Variables
```env
ENCRYPTION_KEY=your-32-character-encryption-key
N8N_WEBHOOK_URL=https://primary-production-9778.up.railway.app/webhook-test/2c73b5be-5924-44a4-942c-55c2d1836d77
```

### Database Setup
- Ensure MongoDB connection is configured
- Run database migrations if needed
- Verify indexes are created for performance

### n8n Setup
- Configure webhook trigger in n8n
- Set up WhatsApp Business API node
- Configure MongoDB connection in n8n
- Set up AI agent integration
- Test end-to-end workflow

## Support

For technical support or questions about this integration:
1. Check this documentation
2. Review error logs
3. Test individual components
4. Contact development team

## Changelog

### Version 1.0.0
- Initial implementation of WhatsApp credential storage
- n8n webhook integration
- Encrypted credential management
- Settings page UI updates
- tRPC procedures for credential management 