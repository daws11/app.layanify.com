import connectToDatabase from '../src/lib/mongodb.js';
import { User, WhatsAppNumber, Conversation, Message, Workflow, AuditLog } from '../src/lib/models';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await WhatsAppNumber.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Workflow.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared existing data');

    // Create test users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 12),
        tier: 'pro',
        // Example WhatsApp credentials (these would be encrypted in real usage)
        whatsappClientId: 'example_client_id_1',
        whatsappClientSecret: 'example_client_secret_1',
        whatsappAccessToken: 'example_access_token_1',
        whatsappBusinessAccountId: 'example_business_account_id_1',
        whatsappPhoneNumberId: 'example_phone_number_id_1',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 12),
        tier: 'enterprise',
        // Example WhatsApp credentials (these would be encrypted in real usage)
        whatsappClientId: 'example_client_id_2',
        whatsappClientSecret: 'example_client_secret_2',
        whatsappAccessToken: 'example_access_token_2',
        whatsappBusinessAccountId: 'example_business_account_id_2',
        whatsappPhoneNumberId: 'example_phone_number_id_2',
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: await bcrypt.hash('password123', 12),
        tier: 'basic',
        // Example WhatsApp credentials (these would be encrypted in real usage)
        whatsappClientId: 'example_client_id_3',
        whatsappClientSecret: 'example_client_secret_3',
        whatsappAccessToken: 'example_access_token_3',
        whatsappBusinessAccountId: 'example_business_account_id_3',
        whatsappPhoneNumberId: 'example_phone_number_id_3',
      }
    ]);
    console.log(`Created ${users.length} users`);

    // Create WhatsApp numbers
    const whatsappNumbers = await WhatsAppNumber.create([
      {
        userId: users[0]._id,
        number: '+628123456789',
        displayName: 'Toko Elektronik Jakarta',
        status: 'approved',
      },
      {
        userId: users[1]._id,
        number: '+628987654321',
        displayName: 'Restoran Padang Sederhana',
        status: 'approved',
      },
      {
        userId: users[2]._id,
        number: '+628555111222',
        displayName: 'Apotek Sehat',
        status: 'pending',
      }
    ]);
    console.log(`Created ${whatsappNumbers.length} WhatsApp numbers`);

    // Create conversations
    const conversations = await Conversation.create([
      {
        userId: users[0]._id,
        whatsappNumberId: whatsappNumbers[0]._id,
        contactNumber: '+628111222333',
        contactName: 'Budi Santoso',
        lastMessageAt: new Date('2024-03-20T10:30:00Z'),
        sessionStartAt: new Date('2024-03-20T09:15:00Z'),
        status: 'active',
      },
      {
        userId: users[1]._id,
        whatsappNumberId: whatsappNumbers[1]._id,
        contactNumber: '+628444555666',
        contactName: 'Siti Aminah',
        lastMessageAt: new Date('2024-03-19T16:45:00Z'),
        sessionStartAt: new Date('2024-03-19T14:20:00Z'),
        sessionEndAt: new Date('2024-03-19T17:00:00Z'),
        status: 'expired',
      },
      {
        userId: users[0]._id,
        whatsappNumberId: whatsappNumbers[0]._id,
        contactNumber: '+628777888999',
        contactName: 'Ahmad Rahman',
        lastMessageAt: new Date('2024-03-21T08:20:00Z'),
        sessionStartAt: new Date('2024-03-21T08:00:00Z'),
        status: 'active',
      }
    ]);
    console.log(`Created ${conversations.length} conversations`);

    // Create messages
    const messages = await Message.create([
      // Conversation 1 - Budi Santoso
      {
        conversationId: conversations[0]._id,
        messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOQAA',
        direction: 'inbound',
        content: {
          type: 'text',
          text: 'Halo, saya mau tanya tentang laptop gaming yang tersedia'
        },
        status: 'read',
        timestamp: new Date('2024-03-20T09:15:00Z'),
        isAutomated: false,
      },
      {
        conversationId: conversations[0]._id,
        messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOQAB',
        direction: 'outbound',
        content: {
          type: 'text',
          text: 'Halo Pak Budi! Terima kasih telah menghubungi Toko Elektronik Jakarta. Kami memiliki berbagai laptop gaming dengan spesifikasi tinggi. Apakah ada budget khusus yang Bapak inginkan?'
        },
        status: 'delivered',
        timestamp: new Date('2024-03-20T09:16:30Z'),
        isAutomated: true,
      },
      {
        conversationId: conversations[0]._id,
        messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOUFD',
        direction: 'inbound',
        content: {
          type: 'text',
          text: 'Budget sekitar 15-20 juta. Ada rekomendasi?'
        },
        status: 'read',
        timestamp: new Date('2024-03-20T09:18:00Z'),
        isAutomated: false,
      },
      {
        conversationId: conversations[0]._id,
        messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOUFE',
        direction: 'outbound',
        content: {
          type: 'text',
          text: 'Perfect! Dengan budget tersebut saya rekomendasikan:\n\n1. ASUS ROG Strix G15 - RTX 4060, Ryzen 7, 16GB RAM (Rp 18.5 juta)\n2. MSI Katana 15 - RTX 4050, i5-13500H, 16GB RAM (Rp 16.2 juta)\n3. Lenovo Legion 5 Pro - RTX 4060, Ryzen 7, 32GB RAM (Rp 19.8 juta)\n\nSemua laptop sudah termasuk garansi resmi 2 tahun. Mau info lebih detail yang mana?'
        },
        status: 'delivered',
        timestamp: new Date('2024-03-20T09:20:15Z'),
        isAutomated: false,
      },

      // Conversation 2 - Siti Aminah (Restaurant Order)
      {
        conversationId: conversations[1]._id,
        messageId: 'wamid.HBgMNjI4NDQ0NTU1NjY2FQIAEhggRDVBQUQyRjdDRUFFNDdENkEA',
        direction: 'inbound',
        content: {
          type: 'text',
          text: 'Assalamu\'alaikum, saya mau pesan rendang dan nasi putih 2 porsi'
        },
        status: 'read',
        timestamp: new Date('2024-03-19T14:20:00Z'),
        isAutomated: false,
      },
      {
        conversationId: conversations[1]._id,
        messageId: 'wamid.HBgMNjI4NDQ0NTU1NjY2FQIAEhggRDVBQUQyRjdDRUFFNDdENkFB',
        direction: 'outbound',
        content: {
          type: 'text',
          text: 'Wa\'alaikumsalam Bu Siti! Siap, pesanan:\n\n🍛 Rendang + Nasi Putih (2 porsi)\n💰 Total: Rp 60.000\n\nAlamat pengiriman yang biasa ya Bu? Jl. Merdeka No. 15?'
        },
        status: 'delivered',
        timestamp: new Date('2024-03-19T14:21:30Z'),
        isAutomated: true,
      },

      // Conversation 3 - Ahmad Rahman (Pharmacy)
      {
        conversationId: conversations[2]._id,
        messageId: 'wamid.HBgMNjI4Nzc3ODg4OTk5FQIAEhggRDVBQUQyRjdDRUFFNDdFN0EA',
        direction: 'inbound',
        content: {
          type: 'text',
          text: 'Selamat pagi, apakah ada obat demam untuk anak 5 tahun?'
        },
        status: 'read',
        timestamp: new Date('2024-03-21T08:00:00Z'),
        isAutomated: false,
      },
      {
        conversationId: conversations[2]._id,
        messageId: 'wamid.HBgMNjI4Nzc3ODg4OTk5FQIAEhggRDVBQUQyRjdDRUFFNDdFN0VB',
        direction: 'outbound',
        content: {
          type: 'text',
          text: 'Selamat pagi Pak Ahmad! Untuk anak 5 tahun, kami tersedia:\n\n💊 Paracetamol Sirup 60ml - Rp 15.000\n💊 Ibuprofen Sirup 100ml - Rp 22.000\n\nKeduanya aman untuk anak. Ada gejala lain selain demam? Sebaiknya konsultasi dengan apoteker kami dulu.'
        },
        status: 'delivered',
        timestamp: new Date('2024-03-21T08:02:15Z'),
        isAutomated: false,
      }
    ]);
    console.log(`Created ${messages.length} messages`);

    // Create workflows
    const workflows = await Workflow.create([
      {
        userId: users[0]._id,
        name: 'Welcome New Customer',
        triggers: ['new_contact', 'first_message'],
        nodes: {
          nodes: [
            { id: '1', type: 'trigger', data: { label: 'New Contact' }, position: { x: 0, y: 0 } },
            { id: '2', type: 'message', data: { label: 'Send Welcome Message' }, position: { x: 200, y: 0 } },
            { id: '3', type: 'delay', data: { label: 'Wait 5 minutes' }, position: { x: 400, y: 0 } },
            { id: '4', type: 'message', data: { label: 'Ask for preferences' }, position: { x: 600, y: 0 } }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' }
          ]
        },
        isActive: true,
      },
      {
        userId: users[1]._id,
        name: 'Order Confirmation',
        triggers: ['order_placed'],
        nodes: {
          nodes: [
            { id: '1', type: 'trigger', data: { label: 'Order Placed' }, position: { x: 0, y: 0 } },
            { id: '2', type: 'message', data: { label: 'Confirm Order Details' }, position: { x: 200, y: 0 } },
            { id: '3', type: 'condition', data: { label: 'Payment Confirmed?' }, position: { x: 400, y: 0 } },
            { id: '4', type: 'message', data: { label: 'Send Receipt' }, position: { x: 600, y: -50 } },
            { id: '5', type: 'message', data: { label: 'Payment Reminder' }, position: { x: 600, y: 50 } }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4', label: 'Yes' },
            { id: 'e3-5', source: '3', target: '5', label: 'No' }
          ]
        },
        isActive: true,
      }
    ]);
    console.log(`Created ${workflows.length} workflows`);

    // Create some audit logs
    const auditLogs = await AuditLog.create([
      {
        userId: users[0]._id,
        action: 'workflow_created',
        resource: 'Workflow',
        resourceId: workflows[0]._id,
        details: { workflowName: 'Welcome New Customer' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: users[1]._id,
        action: 'workflow_created',
        resource: 'Workflow',
        resourceId: workflows[1]._id,
        details: { workflowName: 'Order Confirmation' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      }
    ]);
    console.log(`Created ${auditLogs.length} audit logs`);

    console.log('Database seeded successfully!');
    console.log('\nTest users created:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.tier}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
