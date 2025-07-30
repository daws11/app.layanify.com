'use client';

import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Search, Phone, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useConversations, useConversationMessages, useDataActions } from '@/hooks/use-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
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

// Tambahkan tipe Conversation
interface Conversation {
  id: string;
  contactName?: string;
  contactNumber: string;
  status: string;
  lastMessage?: {
    direction: 'inbound' | 'outbound';
    content: { text: string };
  };
  unreadCount?: number;
}

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch conversations
  const { conversations, loading: isLoading } = useConversations(1, 50);
  // Fetch messages for selected conversation
  const { messages } = useConversationMessages(selectedConversation!);
  // Data actions
  const { sendMessage } = useDataActions();

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      // No explicit markAsRead mutation, useConversations will update on reload
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;
    try {
      await sendMessage(selectedConversation, messageText.trim());
      setMessageText('');
      // No explicit refetch needed, useConversations/useConversationMessages will update on reload
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: err instanceof Error ? err.message : 'Failed to send message',
      });
    }
  };

  const filteredConversations =
    !isLoading && conversations && Array.isArray(conversations.conversations)
      ? (conversations.conversations as Conversation[]).filter((conv) =>
          conv.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.contactNumber.includes(searchQuery)
        )
      : [];

  const selectedConv =
    !isLoading && conversations && Array.isArray(conversations.conversations)
      ? (conversations.conversations as Conversation[]).find((c) => c.id === selectedConversation)
      : undefined;

  const getStatusIcon = (status: string, direction: string) => {
    if (direction === 'inbound') return null;
    
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-6rem)] flex gap-6">
        {/* Conversations List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Badge variant="secondary">{filteredConversations.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-medium">No conversations</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start by adding a WhatsApp number to receive messages.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors',
                        selectedConversation === conversation.id && 'bg-accent'
                      )}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {conversation.contactName?.charAt(0)?.toUpperCase() || 
                           conversation.contactNumber.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {conversation.contactName || conversation.contactNumber}
                          </p>
                          <Badge
                            variant={conversation.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {conversation.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {conversation.contactNumber}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessage.direction === 'outbound' ? 'You: ' : ''}
                            {conversation.lastMessage.content.text}
                          </p>
                        )}
                        {(conversation.unreadCount ?? 0) > 0 && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation && selectedConv ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {selectedConv.contactName?.charAt(0)?.toUpperCase() || 
                       selectedConv.contactNumber.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {selectedConv.contactName || selectedConv.contactNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedConv.contactNumber}
                    </p>
                  </div>
                  <Badge variant={selectedConv.status === 'active' ? 'default' : 'secondary'}>
                    {selectedConv.status}
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  {messages?.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-sm font-medium">No messages yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Start the conversation by sending a message.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message: Message) => (
                        <div
                          key={message.id}
                          className={cn(
                            'flex',
                            message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                              message.direction === 'outbound'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <p className="text-sm">{message.content.text}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                              {getStatusIcon(message.status, message.direction)}
                            </div>
                            {message.isAutomated && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                Automated
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={false} // No explicit loading state from useDataActions
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!messageText.trim()} // No explicit loading state from useDataActions
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Select a conversation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a conversation from the left to start messaging.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
