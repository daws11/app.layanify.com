import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  tier: 'basic' | 'pro' | 'enterprise';
  hasMetaToken: boolean;
  hasN8nKey: boolean;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Selected WhatsApp number
  selectedWhatsAppNumber: string | null;
  setSelectedWhatsAppNumber: (id: string | null) => void;
  
  // Active conversation
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    timestamp: Date;
  }>;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // UI state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      // Selected WhatsApp number
      selectedWhatsAppNumber: null,
      setSelectedWhatsAppNumber: (id) => set({ selectedWhatsAppNumber: id }),
      
      // Active conversation
      activeConversationId: null,
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      
      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
      },
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'layanify-crm-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        selectedWhatsAppNumber: state.selectedWhatsAppNumber,
      }),
    }
  )
);

// Workflow-specific state
interface WorkflowState {
  currentWorkflow: any | null;
  setCurrentWorkflow: (workflow: any | null) => void;
  
  workflowNodes: any[];
  setWorkflowNodes: (nodes: any[]) => void;
  
  workflowEdges: any[];
  setWorkflowEdges: (edges: any[]) => void;
  
  isWorkflowSaving: boolean;
  setIsWorkflowSaving: (saving: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  currentWorkflow: null,
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  workflowNodes: [],
  setWorkflowNodes: (nodes) => set({ workflowNodes: nodes }),
  
  workflowEdges: [],
  setWorkflowEdges: (edges) => set({ workflowEdges: edges }),
  
  isWorkflowSaving: false,
  setIsWorkflowSaving: (saving) => set({ isWorkflowSaving: saving }),
}));

// Conversation-specific state
interface ConversationState {
  conversations: any[];
  setConversations: (conversations: any[]) => void;
  
  messages: Record<string, any[]>;
  setMessages: (conversationId: string, messages: any[]) => void;
  addMessage: (conversationId: string, message: any) => void;
  
  typingIndicators: Record<string, boolean>;
  setTypingIndicator: (conversationId: string, isTyping: boolean) => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  
  messages: {},
  setMessages: (conversationId, messages) => {
    const currentMessages = get().messages;
    set({
      messages: {
        ...currentMessages,
        [conversationId]: messages,
      },
    });
  },
  addMessage: (conversationId, message) => {
    const currentMessages = get().messages;
    const existingMessages = currentMessages[conversationId] || [];
    set({
      messages: {
        ...currentMessages,
        [conversationId]: [...existingMessages, message],
      },
    });
  },
  
  typingIndicators: {},
  setTypingIndicator: (conversationId, isTyping) => {
    const currentIndicators = get().typingIndicators;
    set({
      typingIndicators: {
        ...currentIndicators,
        [conversationId]: isTyping,
      },
    });
  },
}));
