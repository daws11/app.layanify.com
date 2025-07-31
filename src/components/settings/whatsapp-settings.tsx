'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';
import { 
  MessageSquare, 
  Clock, 
  Eye, 
  Type, 
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface WhatsAppSettings {
  autoReply: boolean;
  businessHours: boolean;
  readReceipts: boolean;
  typingIndicator: boolean;
  messageDelay: number;
  // WhatsApp Business API Credentials
  whatsappClientId: string;
  whatsappClientSecret: string;
  whatsappAccessToken: string;
  whatsappBusinessAccountId: string;
  whatsappPhoneNumberId: string;
  // Legacy fields (for backward compatibility)
  metaAccessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl: string;
  autoReplyMessage: string;
}

interface WhatsAppConnectionStatus {
  isConnected: boolean;
  phoneNumbers: Array<{
    id: string;
    number: string;
    displayName: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  lastSync: string | null;
}

export function WhatsAppSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    autoReply: false,
    businessHours: true,
    readReceipts: true,
    typingIndicator: false,
    messageDelay: 2,
    // WhatsApp Business API Credentials
    whatsappClientId: '',
    whatsappClientSecret: '',
    whatsappAccessToken: '',
    whatsappBusinessAccountId: '',
    whatsappPhoneNumberId: '',
    // Legacy fields (for backward compatibility)
    metaAccessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookUrl: '',
    autoReplyMessage: 'Thank you for your message. We will get back to you soon.',
  });

  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnectionStatus>({
    isConnected: false,
    phoneNumbers: [],
    lastSync: null,
  });

  // tRPC queries and mutations
  const { data: profileData } = trpc.auth.getProfile.useQuery();
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'WhatsApp settings updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { data: whatsappNumbers } = trpc.whatsapp.getNumbers.useQuery();

  const testConnectionMutation = trpc.whatsapp.testConnection?.useMutation({
    onSuccess: (data) => {
      setConnectionStatus({
        isConnected: data.isConnected,
        phoneNumbers: data.phoneNumbers || [],
        lastSync: new Date().toISOString(),
      });
      toast({
        title: 'Connection Test',
        description: data.isConnected 
          ? 'WhatsApp Business API connected successfully' 
          : 'Connection failed. Please check your credentials.',
        variant: data.isConnected ? 'default' : 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Connection Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendCredentialsToN8nMutation = trpc.whatsapp.sendCredentialsToN8n.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'WhatsApp credentials sent to n8n successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSaveWhatsAppSettings = async () => {
    setIsLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        // WhatsApp Business API Credentials
        whatsappClientId: whatsappSettings.whatsappClientId,
        whatsappClientSecret: whatsappSettings.whatsappClientSecret,
        whatsappAccessToken: whatsappSettings.whatsappAccessToken,
        whatsappBusinessAccountId: whatsappSettings.whatsappBusinessAccountId,
        whatsappPhoneNumberId: whatsappSettings.whatsappPhoneNumberId,
        // Legacy field (for backward compatibility)
        metaAccessToken: whatsappSettings.metaAccessToken,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await testConnectionMutation.mutateAsync({
        accessToken: whatsappSettings.whatsappAccessToken || whatsappSettings.metaAccessToken,
        phoneNumberId: whatsappSettings.whatsappPhoneNumberId || whatsappSettings.phoneNumberId,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendCredentialsToN8n = async () => {
    try {
      await sendCredentialsToN8nMutation.mutateAsync();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getConnectionStatusIcon = () => {
    if (connectionStatus.isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Business API Connection
          </CardTitle>
          <CardDescription>
            Connect your WhatsApp Business account to enable messaging features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getConnectionStatusIcon()}
              <span className="font-medium">
                {connectionStatus.isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <Button 
              onClick={handleTestConnection}
              disabled={isTestingConnection || !whatsappSettings.metaAccessToken}
              variant="outline"
              size="sm"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {connectionStatus.lastSync && (
            <p className="text-sm text-muted-foreground">
              Last tested: {new Date(connectionStatus.lastSync).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your Meta WhatsApp Business API credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WhatsApp Business API Credentials */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">WhatsApp Business API Credentials</h4>
            
            <div className="space-y-2">
              <Label htmlFor="whatsappClientId">Client ID</Label>
              <Input
                id="whatsappClientId"
                type="password"
                value={whatsappSettings.whatsappClientId}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, whatsappClientId: e.target.value})}
                placeholder="Enter your WhatsApp Client ID"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappClientSecret">Client Secret</Label>
              <Input
                id="whatsappClientSecret"
                type="password"
                value={whatsappSettings.whatsappClientSecret}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, whatsappClientSecret: e.target.value})}
                placeholder="Enter your WhatsApp Client Secret"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappAccessToken">Access Token</Label>
              <Input
                id="whatsappAccessToken"
                type="password"
                value={whatsappSettings.whatsappAccessToken}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, whatsappAccessToken: e.target.value})}
                placeholder="Enter your WhatsApp Access Token"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappBusinessAccountId">Business Account ID</Label>
              <Input
                id="whatsappBusinessAccountId"
                value={whatsappSettings.whatsappBusinessAccountId}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, whatsappBusinessAccountId: e.target.value})}
                placeholder="Enter your WhatsApp Business Account ID"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappPhoneNumberId">Phone Number ID</Label>
              <Input
                id="whatsappPhoneNumberId"
                value={whatsappSettings.whatsappPhoneNumberId}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, whatsappPhoneNumberId: e.target.value})}
                placeholder="Enter your WhatsApp Phone Number ID"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Legacy Configuration (for backward compatibility) */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">Legacy Configuration</h4>
            
            <div className="space-y-2">
              <Label htmlFor="metaAccessToken">Meta Access Token (Legacy)</Label>
              <Input
                id="metaAccessToken"
                type="password"
                value={whatsappSettings.metaAccessToken}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, metaAccessToken: e.target.value})}
                placeholder="Enter your Meta access token"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Get this from Meta for Developers dashboard
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID (Legacy)</Label>
              <Input
                id="phoneNumberId"
                value={whatsappSettings.phoneNumberId}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, phoneNumberId: e.target.value})}
                placeholder="Enter your WhatsApp phone number ID"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAccountId">Business Account ID (Legacy)</Label>
              <Input
                id="businessAccountId"
                value={whatsappSettings.businessAccountId}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, businessAccountId: e.target.value})}
                placeholder="Enter your business account ID"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={whatsappSettings.webhookUrl}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, webhookUrl: e.target.value})}
                placeholder="https://your-domain.com/api/webhooks/whatsapp"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Configure this URL in your Meta app settings
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveWhatsAppSettings} 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
            
            <Button 
              onClick={handleSendCredentialsToN8n}
              disabled={sendCredentialsToN8nMutation.isLoading || isLoading}
              variant="outline"
            >
              {sendCredentialsToN8nMutation.isLoading ? 'Sending...' : 'Send to n8n'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Numbers */}
      {whatsappNumbers && whatsappNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Phone Numbers</CardTitle>
            <CardDescription>
              Your verified WhatsApp Business phone numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {whatsappNumbers.map((number) => (
                <div key={number.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{number.displayName}</span>
                      <Badge variant={number.status === 'approved' ? 'default' : 'secondary'}>
                        {number.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{number.number}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Behavior Settings</CardTitle>
          <CardDescription>
            Configure how your WhatsApp integration behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Reply</Label>
                <p className="text-sm text-muted-foreground">Automatically respond to incoming messages</p>
              </div>
              <Switch
                checked={whatsappSettings.autoReply}
                onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, autoReply: checked})}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Business Hours</Label>
                <p className="text-sm text-muted-foreground">Only auto-respond during business hours</p>
              </div>
              <Switch
                checked={whatsappSettings.businessHours}
                onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, businessHours: checked})}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Read Receipts</Label>
                <p className="text-sm text-muted-foreground">Send read receipts when messages are viewed</p>
              </div>
              <Switch
                checked={whatsappSettings.readReceipts}
                onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, readReceipts: checked})}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Typing Indicator</Label>
                <p className="text-sm text-muted-foreground">Show typing indicator when composing responses</p>
              </div>
              <Switch
                checked={whatsappSettings.typingIndicator}
                onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, typingIndicator: checked})}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageDelay">Message Delay (seconds)</Label>
              <Input
                id="messageDelay"
                type="number"
                value={whatsappSettings.messageDelay}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, messageDelay: parseInt(e.target.value)})}
                min="0"
                max="30"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">Delay before sending automated messages</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoReplyMessage">Auto Reply Message</Label>
              <Textarea
                id="autoReplyMessage"
                value={whatsappSettings.autoReplyMessage}
                onChange={(e) => setWhatsappSettings({...whatsappSettings, autoReplyMessage: e.target.value})}
                placeholder="Enter your auto-reply message"
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create a Meta for Developers account</li>
                <li>Create a WhatsApp Business app</li>
                <li>Add your phone number to the app</li>
                <li>Generate a permanent access token</li>
                <li>Configure webhook URL in your app settings</li>
                <li>Enter your credentials above and test the connection</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
} 