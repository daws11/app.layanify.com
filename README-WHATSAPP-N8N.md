# WhatsApp Business API Integration with n8n

## Overview

This implementation provides a complete solution for storing WhatsApp Business API credentials per user and sending them to n8n for automated message processing. The system includes secure credential storage, user interface for configuration, and integration with n8n workflows.

## Features Implemented

### ✅ Secure Credential Storage
- **Encrypted Storage**: All WhatsApp credentials are encrypted using AES-256-GCM
- **Per-User Credentials**: Each user has their own set of WhatsApp credentials
- **Database Integration**: Credentials stored in MongoDB with encryption

### ✅ User Interface
- **Settings Page**: Refactored settings page with clean component structure
- **WhatsApp Settings**: Dedicated component for WhatsApp credential management
- **Connection Testing**: Users can test their WhatsApp API connection
- **n8n Integration**: Button to send credentials to n8n workflow

### ✅ Backend API
- **tRPC Procedures**: Type-safe API for credential management
- **Encryption/Decryption**: Secure handling of sensitive data
- **n8n Webhook**: Dedicated endpoint for sending credentials to n8n

### ✅ n8n Integration
- **Webhook Endpoint**: API endpoint to send credentials to n8n
- **Payload Structure**: Structured data with user and credential information
- **Error Handling**: Comprehensive error handling and validation

## Database Schema Updates

### User Model
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

### tRPC Procedures

#### `auth.updateProfile`
- Updates user profile including WhatsApp credentials
- Encrypts sensitive fields before storage
- Supports both new WhatsApp credentials and legacy fields

#### `auth.getProfile`
- Returns user profile with credential status
- Includes `hasWhatsAppCredentials` flag

#### `whatsapp.sendCredentialsToN8n`
- Sends user's WhatsApp credentials to n8n
- Validates all required fields are present
- Returns success/error response

### REST API

#### `POST /api/n8n/webhook`
- Alternative endpoint for sending credentials to n8n
- Requires user authentication
- Sends structured payload to n8n

## Frontend Components

### WhatsAppSettings Component
- **Credential Input**: Form fields for all WhatsApp credentials
- **Legacy Support**: Backward compatibility with old credential format
- **Connection Testing**: Test WhatsApp API connection
- **n8n Integration**: Send credentials to n8n workflow

### Settings Page Structure
```
src/components/settings/
├── settings-tabs.tsx          # Main settings container
├── whatsapp-settings.tsx      # WhatsApp configuration
├── profile-settings.tsx       # User profile management
├── notification-settings.tsx  # Notification preferences
├── security-settings.tsx      # API key management
└── data-settings.tsx         # Data export/import
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

## Security Features

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Management**: Environment variable `ENCRYPTION_KEY`
- **IV**: 96-bit random IV for each encryption
- **Storage**: Encrypted data stored in MongoDB

### Access Control
- **Authentication**: All endpoints require user authentication
- **Authorization**: Users can only access their own credentials
- **Session Management**: NextAuth.js handles session validation

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

### 3. Message Processing (Expected n8n Workflow)
1. WhatsApp message arrives at n8n
2. n8n uses stored credentials to process message
3. Message is saved to MongoDB
4. Question is forwarded to AI agent
5. AI response is sent back to WhatsApp

## Files Modified/Created

### Database & Models
- `src/lib/models.ts` - Added WhatsApp credential fields to User model
- `src/lib/encryption.ts` - Updated encryption functions for new fields

### Backend API
- `src/server/routers/auth.ts` - Updated for WhatsApp credential handling
- `src/server/routers/whatsapp.ts` - Added `sendCredentialsToN8n` procedure
- `src/app/api/n8n/webhook/route.ts` - New REST API endpoint

### Frontend Components
- `src/components/settings/whatsapp-settings.tsx` - Updated with new credential fields
- `src/components/settings/settings-tabs.tsx` - Main settings container
- `src/components/settings/profile-settings.tsx` - User profile management
- `src/components/settings/notification-settings.tsx` - Notification preferences
- `src/components/settings/security-settings.tsx` - API key management
- `src/components/settings/data-settings.tsx` - Data export/import

### Documentation
- `docs/whatsapp-n8n-integration.md` - Comprehensive integration documentation
- `docs/refactoring-guide.md` - Settings page refactoring documentation

### Database Seeding
- `scripts/seed-db.ts` - Updated with example WhatsApp credentials

## Environment Variables Required

```env
ENCRYPTION_KEY=your-32-character-encryption-key
N8N_WEBHOOK_URL=https://primary-production-9778.up.railway.app/webhook-test/2c73b5be-5924-44a4-942c-55c2d1836d77
```

## Testing

### Manual Testing Steps
1. Configure WhatsApp credentials in settings
2. Test connection to verify credentials
3. Send credentials to n8n
4. Verify n8n receives and processes credentials
5. Test end-to-end message flow

### Database Seeding
```bash
npm run seed
```

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

## Next Steps

### Immediate Actions
1. **Test the Implementation**: Run the application and test all features
2. **Configure n8n**: Set up the n8n workflow to receive credentials
3. **Test End-to-End**: Verify the complete message flow

### Future Enhancements
- **Credential Rotation**: Automatic credential refresh
- **Multiple Accounts**: Support for multiple WhatsApp accounts per user
- **Webhook Management**: Dynamic webhook URL configuration
- **Analytics**: Track message processing and response times
- **Template Management**: WhatsApp message templates
- **Media Support**: Image, document, and video message handling

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

## Support

For technical support or questions about this integration:
1. Check the documentation in `docs/whatsapp-n8n-integration.md`
2. Review error logs
3. Test individual components
4. Contact development team

## Changelog

### Version 1.0.0
- ✅ Initial implementation of WhatsApp credential storage
- ✅ n8n webhook integration
- ✅ Encrypted credential management
- ✅ Settings page UI updates
- ✅ tRPC procedures for credential management
- ✅ Comprehensive documentation
- ✅ Database seeding with example data 