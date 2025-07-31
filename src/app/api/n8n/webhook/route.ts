import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
import { decryptUserSensitiveFields } from '@/lib/encryption';

const N8N_WEBHOOK_URL = 'https://primary-production-9778.up.railway.app/webhook-test/2c73b5be-5924-44a4-942c-55c2d1836d77';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with WhatsApp credentials
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Decrypt user's sensitive fields
    const decryptedUser = decryptUserSensitiveFields(user);

    // Check if user has WhatsApp credentials
    if (!decryptedUser.whatsappClientId || 
        !decryptedUser.whatsappClientSecret || 
        !decryptedUser.whatsappAccessToken || 
        !decryptedUser.whatsappBusinessAccountId || 
        !decryptedUser.whatsappPhoneNumberId) {
      return NextResponse.json({ 
        error: 'WhatsApp credentials not configured' 
      }, { status: 400 });
    }

    // Prepare payload for n8n
    const n8nPayload = {
      userId: user._id.toString(),
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      whatsappCredentials: {
        clientId: decryptedUser.whatsappClientId,
        clientSecret: decryptedUser.whatsappClientSecret,
        accessToken: decryptedUser.whatsappAccessToken,
        businessAccountId: decryptedUser.whatsappBusinessAccountId,
        phoneNumberId: decryptedUser.whatsappPhoneNumberId,
      },
      // Additional metadata for n8n workflow
      metadata: {
        source: 'layanify-crm',
        version: '1.0.0',
        action: 'whatsapp_credentials_update',
      }
    };

    // Send credentials to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!response.ok) {
      console.error('Failed to send credentials to n8n:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Failed to send credentials to n8n' 
      }, { status: 500 });
    }

    const n8nResponse = await response.json();

    return NextResponse.json({
      success: true,
      message: 'WhatsApp credentials sent to n8n successfully',
      n8nResponse,
    });

  } catch (error) {
    console.error('Error sending credentials to n8n:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'n8n webhook endpoint for WhatsApp credentials' 
  });
} 