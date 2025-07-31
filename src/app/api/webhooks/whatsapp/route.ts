import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppUtils } from '@/lib/whatsapp-api';
import connectToDatabase from '@/lib/mongodb';
import { Conversation, Message, User } from '@/lib/models';
import { decryptUserSensitiveFields } from '@/lib/encryption';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Parse webhook payload
    const payload = WhatsAppUtils.parseWebhookPayload(body);

    // Verify it's a WhatsApp message
    if (payload.object !== 'whatsapp_business_account') {
      return new NextResponse('OK', { status: 200 });
    }

    await connectToDatabase();

    // Process each entry
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          await processMessages(change.value);
        } else if (change.field === 'message_status') {
          await processMessageStatus(change.value);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processMessages(value: any) {
  const { messaging_product, metadata, contacts, messages } = value;

  if (messaging_product !== 'whatsapp' || !messages) {
    return;
  }

  // Find user by phone number ID
  const user = await User.findOne({
    // You might need to store phone number ID in user settings
    // For now, we'll process all messages
  });

  if (!user) {
    console.log('User not found for phone number:', metadata.phone_number_id);
    return;
  }

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const contact = contacts?.[i];

    try {
      // Find or create conversation
      let conversation = await Conversation.findOne({
        userId: user._id,
        contactNumber: message.from,
        status: { $in: ['active', 'expired'] },
      }).sort({ lastMessageAt: -1 });

      if (!conversation) {
        // Create new conversation
        conversation = await Conversation.create({
          userId: user._id,
          whatsappNumberId: null, // You'll need to map phone number ID to WhatsAppNumber
          contactNumber: message.from,
          contactName: contact?.profile?.name,
          lastMessageAt: new Date(parseInt(message.timestamp) * 1000),
          sessionStartAt: new Date(parseInt(message.timestamp) * 1000),
          status: 'active',
        });
      } else {
        // Update conversation
        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessageAt: new Date(parseInt(message.timestamp) * 1000),
          status: 'active',
        });
      }

      // Create message record
      const messageContent = {
        type: message.type as 'text' | 'image' | 'document',
        text: message.text?.body,
        mediaUrl: message.image?.id || message.document?.id,
      };

      await Message.create({
        conversationId: conversation._id,
        messageId: message.id,
        direction: 'inbound',
        content: messageContent,
        status: 'delivered',
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        isAutomated: false,
      });

      console.log(`Message processed: ${message.id} from ${message.from}`);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
}

async function processMessageStatus(value: any) {
  const { statuses } = value;

  if (!statuses) {
    return;
  }

  for (const status of statuses) {
    try {
      // Update message status
      await Message.findOneAndUpdate(
        { messageId: status.id },
        { 
          status: status.status,
          updatedAt: new Date(parseInt(status.timestamp) * 1000),
        }
      );

      console.log(`Message status updated: ${status.id} -> ${status.status}`);
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }
} 