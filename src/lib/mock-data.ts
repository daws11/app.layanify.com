import { IUser, IWhatsAppNumber, IWorkflow, IConversation, IMessage, IAuditLog } from './models';

// Data dummy yang realistis untuk testing UI
export const mockUsers: Partial<IUser>[] = [
  {
    _id: '507f1f77bcf86cd799439011' as any,
    name: 'John Doe',
    email: 'john.doe@example.com',
    tier: 'pro',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    _id: '507f1f77bcf86cd799439012' as any,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    tier: 'enterprise',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    _id: '507f1f77bcf86cd799439013' as any,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    tier: 'basic',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15'),
  }
];

export const mockWhatsAppNumbers: Partial<IWhatsAppNumber>[] = [
  {
    _id: '507f1f77bcf86cd799439021' as any,
    userId: '507f1f77bcf86cd799439011' as any,
    number: '+628123456789',
    displayName: 'Toko Elektronik Jakarta',
    status: 'approved',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    _id: '507f1f77bcf86cd799439022' as any,
    userId: '507f1f77bcf86cd799439012' as any,
    number: '+628987654321',
    displayName: 'Restoran Padang Sederhana',
    status: 'approved',
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    _id: '507f1f77bcf86cd799439023' as any,
    userId: '507f1f77bcf86cd799439013' as any,
    number: '+628555111222',
    displayName: 'Apotek Sehat',
    status: 'pending',
    createdAt: new Date('2024-03-11'),
    updatedAt: new Date('2024-03-15'),
  }
];

export const mockWorkflows: Partial<IWorkflow>[] = [
  {
    _id: '507f1f77bcf86cd799439031' as any,
    userId: '507f1f77bcf86cd799439011' as any,
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
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    _id: '507f1f77bcf86cd799439032' as any,
    userId: '507f1f77bcf86cd799439012' as any,
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
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    _id: '507f1f77bcf86cd799439033' as any,
    userId: '507f1f77bcf86cd799439013' as any,
    name: 'Appointment Reminder',
    triggers: ['appointment_scheduled'],
    nodes: {
      nodes: [
        { id: '1', type: 'trigger', data: { label: 'Appointment Scheduled' }, position: { x: 0, y: 0 } },
        { id: '2', type: 'delay', data: { label: 'Wait 1 day before' }, position: { x: 200, y: 0 } },
        { id: '3', type: 'message', data: { label: 'Send Reminder' }, position: { x: 400, y: 0 } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' }
      ]
    },
    isActive: false,
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-16'),
  }
];

export const mockConversations: Partial<IConversation>[] = [
  {
    _id: '507f1f77bcf86cd799439041' as any,
    userId: '507f1f77bcf86cd799439011' as any,
    whatsappNumberId: '507f1f77bcf86cd799439021' as any,
    contactNumber: '+628111222333',
    contactName: 'Budi Santoso',
    lastMessageAt: new Date('2024-03-20T10:30:00Z'),
    sessionStartAt: new Date('2024-03-20T09:15:00Z'),
    status: 'active',
    createdAt: new Date('2024-03-20T09:15:00Z'),
    updatedAt: new Date('2024-03-20T10:30:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439042' as any,
    userId: '507f1f77bcf86cd799439012' as any,
    whatsappNumberId: '507f1f77bcf86cd799439022' as any,
    contactNumber: '+628444555666',
    contactName: 'Siti Aminah',
    lastMessageAt: new Date('2024-03-19T16:45:00Z'),
    sessionStartAt: new Date('2024-03-19T14:20:00Z'),
    sessionEndAt: new Date('2024-03-19T17:00:00Z'),
    status: 'expired',
    createdAt: new Date('2024-03-19T14:20:00Z'),
    updatedAt: new Date('2024-03-19T17:00:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439043' as any,
    userId: '507f1f77bcf86cd799439011' as any,
    whatsappNumberId: '507f1f77bcf86cd799439021' as any,
    contactNumber: '+628777888999',
    contactName: 'Ahmad Rahman',
    lastMessageAt: new Date('2024-03-21T08:20:00Z'),
    sessionStartAt: new Date('2024-03-21T08:00:00Z'),
    status: 'active',
    createdAt: new Date('2024-03-21T08:00:00Z'),
    updatedAt: new Date('2024-03-21T08:20:00Z'),
  }
];

export const mockMessages: Partial<IMessage>[] = [
  // Conversation 1 - Budi Santoso
  {
    _id: '507f1f77bcf86cd799439051' as any,
    conversationId: '507f1f77bcf86cd799439041' as any,
    messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOQAA',
    direction: 'inbound',
    content: {
      type: 'text',
      text: 'Halo, saya mau tanya tentang laptop gaming yang tersedia'
    },
    status: 'read',
    timestamp: new Date('2024-03-20T09:15:00Z'),
    isAutomated: false,
    createdAt: new Date('2024-03-20T09:15:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439052' as any,
    conversationId: '507f1f77bcf86cd799439041' as any,
    messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOQAB',
    direction: 'outbound',
    content: {
      type: 'text',
      text: 'Halo Pak Budi! Terima kasih telah menghubungi Toko Elektronik Jakarta. Kami memiliki berbagai laptop gaming dengan spesifikasi tinggi. Apakah ada budget khusus yang Bapak inginkan?'
    },
    status: 'delivered',
    timestamp: new Date('2024-03-20T09:16:30Z'),
    isAutomated: true,
    createdAt: new Date('2024-03-20T09:16:30Z'),
  },
  {
    _id: '507f1f77bcf86cd799439053' as any,
    conversationId: '507f1f77bcf86cd799439041' as any,
    messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOUFD',
    direction: 'inbound',
    content: {
      type: 'text',
      text: 'Budget sekitar 15-20 juta. Ada rekomendasi?'
    },
    status: 'read',
    timestamp: new Date('2024-03-20T09:18:00Z'),
    isAutomated: false,
    createdAt: new Date('2024-03-20T09:18:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439054' as any,
    conversationId: '507f1f77bcf86cd799439041' as any,
    messageId: 'wamid.HBgMNjI4MTExMjIyMzMzFQIAEhggRDVBQUQyRjdDRUFFNDdDOUFE',
    direction: 'outbound',
    content: {
      type: 'text',
      text: 'Perfect! Dengan budget tersebut saya rekomendasikan:\n\n1. ASUS ROG Strix G15 - RTX 4060, Ryzen 7, 16GB RAM (Rp 18.5 juta)\n2. MSI Katana 15 - RTX 4050, i5-13500H, 16GB RAM (Rp 16.2 juta)\n3. Lenovo Legion 5 Pro - RTX 4060, Ryzen 7, 32GB RAM (Rp 19.8 juta)\n\nSemua laptop sudah termasuk garansi resmi 2 tahun. Mau info lebih detail yang mana?'
    },
    status: 'delivered',
    timestamp: new Date('2024-03-20T09:20:15Z'),
    isAutomated: false,
    createdAt: new Date('2024-03-20T09:20:15Z'),
  },

  // Conversation 2 - Siti Aminah (Restaurant Order)
  {
    _id: '507f1f77bcf86cd799439055' as any,
    conversationId: '507f1f77bcf86cd799439042' as any,
    messageId: 'wamid.HBgMNjI4NDQ0NTU1NjY2FQIAEhggRDVBQUQyRjdDRUFFNDdENkEA',
    direction: 'inbound',
    content: {
      type: 'text',
      text: 'Assalamu\'alaikum, saya mau pesan rendang dan nasi putih 2 porsi'
    },
    status: 'read',
    timestamp: new Date('2024-03-19T14:20:00Z'),
    isAutomated: false,
    createdAt: new Date('2024-03-19T14:20:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439056' as any,
    conversationId: '507f1f77bcf86cd799439042' as any,
    messageId: 'wamid.HBgMNjI4NDQ0NTU1NjY2FQIAEhggRDVBQUQyRjdDRUFFNDdENkFB',
    direction: 'outbound',
    content: {
      type: 'text',
      text: 'Wa\'alaikumsalam Bu Siti! Siap, pesanan:\n\n🍛 Rendang + Nasi Putih (2 porsi)\n💰 Total: Rp 60.000\n\nAlamat pengiriman yang biasa ya Bu? Jl. Merdeka No. 15?'
    },
    status: 'delivered',
    timestamp: new Date('2024-03-19T14:21:30Z'),
    isAutomated: true,
    createdAt: new Date('2024-03-19T14:21:30Z'),
  },

  // Conversation 3 - Ahmad Rahman (Pharmacy)
  {
    _id: '507f1f77bcf86cd799439057' as any,
    conversationId: '507f1f77bcf86cd799439043' as any,
    messageId: 'wamid.HBgMNjI4Nzc3ODg4OTk5FQIAEhggRDVBQUQyRjdDRUFFNDdFN0EA',
    direction: 'inbound',
    content: {
      type: 'text',
      text: 'Selamat pagi, apakah ada obat demam untuk anak 5 tahun?'
    },
    status: 'read',
    timestamp: new Date('2024-03-21T08:00:00Z'),
    isAutomated: false,
    createdAt: new Date('2024-03-21T08:00:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439058' as any,
    conversationId: '507f1f77bcf86cd799439043' as any,
    messageId: 'wamid.HBgMNjI4Nzc3ODg4OTk5FQIAEhggRDVBQUQyRjdDRUFFNDdFN0VB',
    direction: 'outbound',
    content: {
      type: 'text',
      text: 'Selamat pagi Pak Ahmad! Untuk anak 5 tahun, kami tersedia:\n\n💊 Paracetamol Sirup 60ml - Rp 15.000\n💊 Ibuprofen Sirup 100ml - Rp 22.000\n\nKeduanya aman untuk anak. Ada gejala lain selain demam? Sebaiknya konsultasi dengan apoteker kami dulu.'
    },
    status: 'delivered',
    timestamp: new Date('2024-03-21T08:02:15Z'),
    isAutomated: false,
    createdAt: new Date('2024-03-21T08:02:15Z'),
  }
];

export const mockAuditLogs: Partial<IAuditLog>[] = [
  {
    _id: '507f1f77bcf86cd799439061' as any,
    userId: '507f1f77bcf86cd799439011' as any,
    action: 'workflow_created',
    resource: 'workflow',
    resourceId: '507f1f77bcf86cd799439031',
    details: { workflowName: 'Welcome New Customer' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439062' as any,
    userId: '507f1f77bcf86cd799439012' as any,
    action: 'whatsapp_number_added',
    resource: 'whatsapp_number',
    resourceId: '507f1f77bcf86cd799439022',
    details: { number: '+628987654321', displayName: 'Restoran Padang Sederhana' },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-02-02T09:30:00Z'),
  },
  {
    _id: '507f1f77bcf86cd799439063' as any,
    userId: '507f1f77bcf86cd799439011' as any,
    action: 'message_sent',
    resource: 'message',
    resourceId: '507f1f77bcf86cd799439052',
    details: { 
      to: '+628111222333', 
      messageType: 'text',
      automated: true 
    },
    ipAddress: '192.168.1.100',
    userAgent: 'WhatsApp-Business-API',
    createdAt: new Date('2024-03-20T09:16:30Z'),
  }
];

// Fungsi untuk generate data dummy berdasarkan environment
export const generateMockData = () => {
  return {
    users: mockUsers,
    whatsappNumbers: mockWhatsAppNumbers,
    workflows: mockWorkflows,
    conversations: mockConversations,
    messages: mockMessages,
    auditLogs: mockAuditLogs,
  };
};

// Fungsi untuk mendapatkan data berdasarkan user ID
export const getMockDataByUserId = (userId: string) => {
  const data = generateMockData();
  
  // For demo user or if no specific user found, return first user's data for demonstration
  const targetUserId = userId === 'demo-user' ? '507f1f77bcf86cd799439011' : userId;
  
  return {
    user: data.users.find(u => u._id?.toString() === targetUserId) || data.users[0],
    whatsappNumbers: data.whatsappNumbers.filter(w => w.userId?.toString() === targetUserId),
    workflows: data.workflows.filter(w => w.userId?.toString() === targetUserId),
    conversations: data.conversations.filter(c => c.userId?.toString() === targetUserId),
    messages: data.messages.filter(m => {
      const conversation = data.conversations.find(c => 
        c._id?.toString() === m.conversationId?.toString() && 
        c.userId?.toString() === targetUserId
      );
      return !!conversation;
    }),
    auditLogs: data.auditLogs.filter(a => a.userId?.toString() === targetUserId),
  };
};

// Analytics mock data
export const mockAnalytics = {
  overview: {
    totalMessages: 1547,
    activeConversations: 23,
    responseTime: '2m 34s',
    automationRate: 78,
  },
  messageStats: {
    daily: [
      { date: '2024-03-15', sent: 45, received: 67, automated: 35 },
      { date: '2024-03-16', sent: 52, received: 73, automated: 41 },
      { date: '2024-03-17', sent: 38, received: 54, automated: 29 },
      { date: '2024-03-18', sent: 61, received: 82, automated: 47 },
      { date: '2024-03-19', sent: 49, received: 71, automated: 38 },
      { date: '2024-03-20', sent: 57, received: 78, automated: 44 },
      { date: '2024-03-21', sent: 43, received: 59, automated: 33 },
    ],
  },
  conversationStats: {
    byStatus: {
      active: 23,
      expired: 156,
      'opted-out': 8,
    },
    byHour: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 20) + 1,
    })),
  },
  workflowStats: {
    performance: [
      { name: 'Welcome New Customer', executions: 145, successRate: 94 },
      { name: 'Order Confirmation', executions: 89, successRate: 97 },
      { name: 'Appointment Reminder', executions: 67, successRate: 91 },
    ],
  },
};

// Contact mock data untuk fitur contacts
export const mockContacts = [
  {
    id: '1',
    name: 'Budi Santoso',
    phone: '+628111222333',
    email: 'budi.santoso@email.com',
    tags: ['customer', 'electronics'],
    lastContact: new Date('2024-03-20T10:30:00Z'),
    totalMessages: 12,
    status: 'active',
    notes: 'Interested in gaming laptops, budget 15-20 million',
    customFields: {
      company: 'PT. Teknologi Maju',
      position: 'IT Manager',
      address: 'Jakarta Selatan'
    }
  },
  {
    id: '2',
    name: 'Siti Aminah',
    phone: '+628444555666',
    email: 'siti.aminah@email.com',
    tags: ['customer', 'food', 'regular'],
    lastContact: new Date('2024-03-19T16:45:00Z'),
    totalMessages: 45,
    status: 'active',
    notes: 'Regular customer, usually orders rendang',
    customFields: {
      favoriteFood: 'Rendang',
      address: 'Jl. Merdeka No. 15',
      orderFrequency: 'weekly'
    }
  },
  {
    id: '3',
    name: 'Ahmad Rahman',
    phone: '+628777888999',
    email: 'ahmad.rahman@email.com',
    tags: ['customer', 'pharmacy'],
    lastContact: new Date('2024-03-21T08:20:00Z'),
    totalMessages: 8,
    status: 'active',
    notes: 'Has children, often buys children medication',
    customFields: {
      children: '2 (ages 5 and 8)',
      address: 'Depok',
      preferredContactTime: 'morning'
    }
  }
];
