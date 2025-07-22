import { 
  generateMockData, 
  getMockDataByUserId, 
  mockAnalytics, 
  mockContacts 
} from './mock-data';

// Environment variable untuk menentukan apakah menggunakan mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development';

/**
 * Data Service yang dapat beralih antara mock data dan real data
 * Berguna untuk testing UI tanpa memerlukan database atau API eksternal
 */
export class DataService {
  
  /**
   * Mendapatkan semua data untuk user tertentu
   */
  static async getUserData(userId: string) {
    if (USE_MOCK_DATA) {
      return getMockDataByUserId(userId);
    }
    
    // TODO: Implementasi real data fetching dari database
    // const user = await User.findById(userId);
    // const whatsappNumbers = await WhatsAppNumber.find({ userId });
    // dst...
    
    return {
      user: null,
      whatsappNumbers: [],
      workflows: [],
      conversations: [],
      messages: [],
      auditLogs: [],
    };
  }

  /**
   * Mendapatkan data analytics
   */
  static async getAnalytics(userId: string) {
    if (USE_MOCK_DATA) {
      return mockAnalytics;
    }
    
    // TODO: Implementasi real analytics dari database
    return {
      overview: {
        totalMessages: 0,
        activeConversations: 0,
        responseTime: '0s',
        automationRate: 0,
      },
      messageStats: { daily: [] },
      conversationStats: { byStatus: {}, byHour: [] },
      workflowStats: { performance: [] },
    };
  }

  /**
   * Mendapatkan data contacts
   */
  static async getContacts(userId: string) {
    if (USE_MOCK_DATA) {
      return mockContacts;
    }
    
    // TODO: Implementasi real contacts dari database
    return [];
  }

  /**
   * Mendapatkan conversations dengan pagination
   */
  static async getConversations(userId: string, page = 1, limit = 10) {
    if (USE_MOCK_DATA) {
      const data = getMockDataByUserId(userId);
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return {
        conversations: data.conversations.slice(start, end),
        total: data.conversations.length,
        page,
        limit,
        totalPages: Math.ceil(data.conversations.length / limit),
      };
    }
    
    // TODO: Implementasi real pagination dari database
    return {
      conversations: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  /**
   * Mendapatkan messages untuk conversation tertentu
   */
  static async getConversationMessages(conversationId: string) {
    if (USE_MOCK_DATA) {
      const data = generateMockData();
      return data.messages.filter(m => 
        m.conversationId?.toString() === conversationId
      );
    }
    
    // TODO: Implementasi real messages dari database
    return [];
  }

  /**
   * Mendapatkan workflows
   */
  static async getWorkflows(userId: string) {
    if (USE_MOCK_DATA) {
      const data = getMockDataByUserId(userId);
      return data.workflows;
    }
    
    // TODO: Implementasi real workflows dari database
    return [];
  }

  /**
   * Mendapatkan WhatsApp numbers
   */
  static async getWhatsAppNumbers(userId: string) {
    if (USE_MOCK_DATA) {
      const data = getMockDataByUserId(userId);
      return data.whatsappNumbers;
    }
    
    // TODO: Implementasi real WhatsApp numbers dari database
    return [];
  }

  /**
   * Mengirim message (mock implementation)
   */
  static async sendMessage(to: string, message: string, from?: string) {
    if (USE_MOCK_DATA) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Mock: Sending message', { to, message, from });
      
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
        timestamp: new Date(),
      };
    }
    
    // TODO: Implementasi real WhatsApp API call
    return {
      success: false,
      error: 'Real WhatsApp API not implemented yet',
    };
  }

  /**
   * Create workflow (mock implementation)
   */
  static async createWorkflow(userId: string, workflowData: any) {
    if (USE_MOCK_DATA) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Mock: Creating workflow', { userId, workflowData });
      
      return {
        success: true,
        workflowId: `mock_workflow_${Date.now()}`,
        message: 'Workflow created successfully',
      };
    }
    
    // TODO: Implementasi real workflow creation
    return {
      success: false,
      error: 'Real workflow creation not implemented yet',
    };
  }

  /**
   * Update workflow status
   */
  static async updateWorkflowStatus(workflowId: string, isActive: boolean) {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Mock: Updating workflow status', { workflowId, isActive });
      
      return {
        success: true,
        message: `Workflow ${isActive ? 'activated' : 'deactivated'} successfully`,
      };
    }
    
    // TODO: Implementasi real workflow status update
    return {
      success: false,
      error: 'Real workflow status update not implemented yet',
    };
  }

  /**
   * Add WhatsApp number
   */
  static async addWhatsAppNumber(userId: string, number: string, displayName: string) {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Mock: Adding WhatsApp number', { userId, number, displayName });
      
      return {
        success: true,
        numberId: `mock_number_${Date.now()}`,
        status: 'pending',
        message: 'WhatsApp number added and verification initiated',
      };
    }
    
    // TODO: Implementasi real WhatsApp number verification
    return {
      success: false,
      error: 'Real WhatsApp number verification not implemented yet',
    };
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(userId: string, page = 1, limit = 20) {
    if (USE_MOCK_DATA) {
      const data = getMockDataByUserId(userId);
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return {
        logs: data.auditLogs.slice(start, end),
        total: data.auditLogs.length,
        page,
        limit,
        totalPages: Math.ceil(data.auditLogs.length / limit),
      };
    }
    
    // TODO: Implementasi real audit logs dari database
    return {
      logs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  /**
   * Search conversations
   */
  static async searchConversations(userId: string, query: string) {
    if (USE_MOCK_DATA) {
      const data = getMockDataByUserId(userId);
      const filtered = data.conversations.filter(conv => 
        conv.contactName?.toLowerCase().includes(query.toLowerCase()) ||
        conv.contactNumber?.includes(query)
      );
      
      return filtered;
    }
    
    // TODO: Implementasi real search dari database
    return [];
  }

  /**
   * Get dashboard stats
   */
  static async getDashboardStats(userId: string) {
    if (USE_MOCK_DATA) {
      const data = getMockDataByUserId(userId);
      
      return {
        totalConversations: data.conversations.length,
        activeConversations: data.conversations.filter(c => c.status === 'active').length,
        totalMessages: data.messages.length,
        automatedMessages: data.messages.filter(m => m.isAutomated).length,
        whatsappNumbers: data.whatsappNumbers.length,
        activeWorkflows: data.workflows.filter(w => w.isActive).length,
      };
    }
    
    // TODO: Implementasi real dashboard stats
    return {
      totalConversations: 0,
      activeConversations: 0,
      totalMessages: 0,
      automatedMessages: 0,
      whatsappNumbers: 0,
      activeWorkflows: 0,
    };
  }
}

// Helper function untuk check apakah menggunakan mock data
export const isUsingMockData = () => USE_MOCK_DATA;

// Helper function untuk generate notification message
export const getMockDataNotification = () => {
  if (USE_MOCK_DATA) {
    return {
      type: 'info' as const,
      message: 'Aplikasi sedang menggunakan data dummy untuk testing. Data ini tidak akan disimpan secara permanen.',
      showInProduction: false,
    };
  }
  return null;
};
