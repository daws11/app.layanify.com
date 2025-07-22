import { useState, useEffect } from 'react';
import { DataService, isUsingMockData, getMockDataNotification } from '@/lib/data-service';
import { useSession } from 'next-auth/react';
import { useToast } from './use-toast';

/**
 * Hook untuk menggunakan data service dengan loading states dan error handling
 */
export function useUserData() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const userData = await DataService.getUserData(session.user.id);
        setData(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.user?.id]);

  return { data, loading, error, refetch: () => window.location.reload() };
}

/**
 * Hook untuk dashboard statistics
 */
export function useDashboardStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      // For development/demo, use mock user ID if session not available
      const userId = session?.user?.id || 'demo-user';
      
      try {
        setLoading(true);
        const dashboardStats = await DataService.getDashboardStats(userId);
        setStats(dashboardStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [session?.user?.id]);

  return { stats, loading, error };
}

/**
 * Hook untuk analytics data
 */
export function useAnalytics() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      const userId = session?.user?.id || 'demo-user';
      
      try {
        setLoading(true);
        const analyticsData = await DataService.getAnalytics(userId);
        setAnalytics(analyticsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [session?.user?.id]);

  return { analytics, loading, error };
}

/**
 * Hook untuk conversations dengan pagination
 */
export function useConversations(page = 1, limit = 10) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      const userId = session?.user?.id || 'demo-user';
      
      try {
        setLoading(true);
        const conversationsData = await DataService.getConversations(userId, page, limit);
        setConversations(conversationsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [session?.user?.id, page, limit]);

  return { conversations, loading, error };
}

/**
 * Hook untuk messages dalam conversation tertentu
 */
export function useConversationMessages(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      if (!conversationId) return;
      
      try {
        setLoading(true);
        const messagesData = await DataService.getConversationMessages(conversationId);
        setMessages(messagesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [conversationId]);

  return { messages, loading, error };
}

/**
 * Hook untuk workflows
 */
export function useWorkflows() {
  const { data: session } = useSession();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflows() {
      const userId = session?.user?.id || 'demo-user';
      
      try {
        setLoading(true);
        const workflowsData = await DataService.getWorkflows(userId);
        setWorkflows(workflowsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, [session?.user?.id]);

  return { workflows, loading, error };
}

/**
 * Hook untuk WhatsApp numbers
 */
export function useWhatsAppNumbers() {
  const { data: session } = useSession();
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNumbers() {
      const userId = session?.user?.id || 'demo-user';
      
      try {
        setLoading(true);
        const numbersData = await DataService.getWhatsAppNumbers(userId);
        setNumbers(numbersData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch WhatsApp numbers');
      } finally {
        setLoading(false);
      }
    }

    fetchNumbers();
  }, [session?.user?.id]);

  return { numbers, loading, error };
}

/**
 * Hook untuk contacts
 */
export function useContacts() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContacts() {
      const userId = session?.user?.id || 'demo-user';
      
      try {
        setLoading(true);
        const contactsData = await DataService.getContacts(userId);
        setContacts(contactsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [session?.user?.id]);

  return { contacts, loading, error };
}

/**
 * Hook untuk actions (send message, create workflow, etc.)
 */
export function useDataActions() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const sendMessage = async (to: string, message: string, from?: string) => {
    try {
      setLoading(true);
      const result = await DataService.sendMessage(to, message, from);
      
      if (result.success) {
        toast({
          title: "Message Sent",
          description: "Message sent successfully",
        });
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflowData: any) => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const result = await DataService.createWorkflow(session.user.id, workflowData);
      
      if (result.success) {
        toast({
          title: "Workflow Created",
          description: result.message,
        });
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    try {
      setLoading(true);
      const result = await DataService.updateWorkflowStatus(workflowId, isActive);
      
      if (result.success) {
        toast({
          title: "Workflow Updated",
          description: result.message,
        });
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update workflow",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addWhatsAppNumber = async (number: string, displayName: string) => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const result = await DataService.addWhatsAppNumber(session.user.id, number, displayName);
      
      if (result.success) {
        toast({
          title: "WhatsApp Number Added",
          description: result.message,
        });
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add WhatsApp number",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    createWorkflow,
    updateWorkflowStatus,
    addWhatsAppNumber,
    loading,
  };
}

/**
 * Hook untuk menampilkan notifikasi bahwa aplikasi menggunakan mock data
 */
export function useMockDataNotification() {
  const { toast } = useToast();

  useEffect(() => {
    const notification = getMockDataNotification();
    if (notification && isUsingMockData()) {
      // Tampilkan notifikasi setelah 2 detik
      const timer = setTimeout(() => {
        toast({
          title: "Demo Mode",
          description: notification.message,
          duration: 5000,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  return {
    isUsingMockData: isUsingMockData(),
    notification: getMockDataNotification(),
  };
}
