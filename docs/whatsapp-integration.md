# WhatsApp Business API Integration

## Overview

Layanify CRM telah diintegrasikan dengan WhatsApp Business API untuk memungkinkan pengguna mengelola percakapan WhatsApp secara langsung dari aplikasi CRM.

## Fitur yang Tersedia

### 1. Koneksi WhatsApp Business API
- Konfigurasi Meta Access Token
- Verifikasi koneksi real-time
- Manajemen Phone Number ID
- Setup webhook untuk menerima pesan

### 2. Pengaturan WhatsApp
- Auto-reply configuration
- Business hours settings
- Read receipts management
- Typing indicator control
- Message delay settings

### 3. Manajemen Pesan
- Real-time message processing
- Message status tracking
- Conversation management
- Contact information storage

## Setup Instructions

### 1. Meta for Developers Setup

1. **Buat Meta for Developers Account**
   - Kunjungi [Meta for Developers](https://developers.facebook.com/)
   - Buat akun developer baru

2. **Buat WhatsApp Business App**
   - Klik "Create App"
   - Pilih "Business" sebagai tipe aplikasi
   - Pilih "WhatsApp" sebagai produk

3. **Konfigurasi WhatsApp Business**
   - Tambahkan nomor telepon WhatsApp Business
   - Verifikasi nomor telepon
   - Generate permanent access token

### 2. Environment Variables

Tambahkan variabel berikut ke file `.env.local`:

```env
# WhatsApp Business API
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
```

### 3. Webhook Configuration

1. **Setup Webhook URL**
   - URL: `https://your-domain.com/api/webhooks/whatsapp`
   - Verify Token: `your-webhook-verify-token`
   - Subscribe to: `messages` dan `message_status`

2. **Webhook Events**
   - `messages`: Untuk menerima pesan masuk
   - `message_status`: Untuk tracking status pengiriman

## API Endpoints

### WhatsApp Settings
- `GET /api/trpc/whatsapp.getNumbers` - Get connected phone numbers
- `POST /api/trpc/whatsapp.addNumber` - Add new phone number
- `PUT /api/trpc/whatsapp.updateNumber` - Update phone number
- `DELETE /api/trpc/whatsapp.deleteNumber` - Delete phone number
- `POST /api/trpc/whatsapp.testConnection` - Test API connection

### Webhook
- `GET /api/webhooks/whatsapp` - Webhook verification
- `POST /api/webhooks/whatsapp` - Receive webhook events

## Komponen Frontend

### 1. WhatsAppSettings Component
```typescript
// src/components/settings/whatsapp-settings.tsx
- Connection status display
- API configuration form
- Behavior settings
- Setup instructions
```

### 2. WhatsApp API Service
```typescript
// src/lib/whatsapp-api.ts
- WhatsAppBusinessAPI class
- Message sending methods
- Connection testing
- Webhook utilities
```

## Database Schema

### WhatsAppNumber Model
```typescript
interface IWhatsAppNumber {
  userId: mongoose.Types.ObjectId;
  number: string;
  displayName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Model
```typescript
interface IMessage {
  conversationId: mongoose.Types.ObjectId;
  messageId: string;
  direction: 'inbound' | 'outbound';
  content: {
    type: 'text' | 'image' | 'document' | 'template';
    text?: string;
    mediaUrl?: string;
    templateName?: string;
    templateParams?: string[];
  };
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  isAutomated: boolean;
}
```

## Message Flow

### 1. Pesan Masuk
1. WhatsApp mengirim webhook ke `/api/webhooks/whatsapp`
2. Webhook handler memproses pesan
3. Sistem mencari atau membuat conversation
4. Message disimpan ke database
5. UI diupdate secara real-time

### 2. Pesan Keluar
1. User mengirim pesan melalui UI
2. tRPC mutation dipanggil
3. WhatsApp API dikirim pesan
4. Message disimpan ke database
5. Status tracking diupdate

## Error Handling

### Common Errors
- **Invalid Access Token**: Periksa Meta Access Token
- **Phone Number Not Found**: Verifikasi Phone Number ID
- **Webhook Verification Failed**: Periksa Verify Token
- **Rate Limit Exceeded**: Implementasi rate limiting

### Error Recovery
- Automatic retry untuk failed messages
- Connection status monitoring
- Fallback untuk offline scenarios

## Security Considerations

### 1. Token Encryption
- Meta Access Token dienkripsi sebelum disimpan
- Menggunakan AES-256-GCM encryption
- Key rotation support

### 2. Webhook Security
- Verify token validation
- HTTPS requirement
- IP whitelisting (optional)

### 3. Data Privacy
- Message content encryption
- GDPR compliance
- Data retention policies

## Monitoring & Logging

### 1. Webhook Logs
```typescript
// Log semua webhook events
console.log('Webhook received:', JSON.stringify(body, null, 2));
```

### 2. Message Processing
```typescript
// Log message processing
console.log(`Message processed: ${message.id} from ${message.from}`);
```

### 3. Error Tracking
```typescript
// Log errors dengan context
console.error('Error processing message:', error);
```

## Testing

### 1. Connection Test
```typescript
// Test koneksi WhatsApp API
const result = await whatsappAPI.testConnection();
```

### 2. Webhook Testing
- Gunakan ngrok untuk local testing
- Test dengan sample payload
- Verify webhook signature

### 3. Message Testing
- Test inbound messages
- Test outbound messages
- Test message status updates

## Troubleshooting

### 1. Connection Issues
- Periksa Meta Access Token
- Verifikasi Phone Number ID
- Check network connectivity

### 2. Webhook Issues
- Periksa webhook URL
- Verify token configuration
- Check server logs

### 3. Message Issues
- Periksa message format
- Verify phone number format
- Check rate limits

## Future Enhancements

### 1. Advanced Features
- Media message support
- Template message support
- Bulk messaging
- Message scheduling

### 2. Analytics
- Message delivery rates
- Response time metrics
- Conversation analytics
- Business insights

### 3. Automation
- Auto-reply rules
- Workflow triggers
- AI-powered responses
- Smart routing

## Support

Untuk bantuan teknis atau pertanyaan tentang integrasi WhatsApp Business API, silakan hubungi tim development atau buat issue di repository. 