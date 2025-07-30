'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Zap, 
  Database, 
  Palette,
  Globe,
  Key,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    timezone: 'Asia/Jakarta',
    language: 'en',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newMessages: true,
    workflowUpdates: true,
    weeklyReports: false,
    securityAlerts: true,
  });

  // WhatsApp settings
  const [whatsappSettings, setWhatsappSettings] = useState({
    autoReply: false,
    businessHours: true,
    readReceipts: true,
    typingIndicator: false,
    messageDelay: 2,
  });

  // API keys
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API', key: 'la_••••••••••••••••••', created: '2024-01-15', lastUsed: '2 hours ago' },
    { id: '2', name: 'Development API', key: 'la_••••••••••••••••••', created: '2024-01-10', lastUsed: '5 days ago' }
  ]);

  const handleSaveProfile = () => {
    // In real app, this would use tRPC mutation
    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Success',
      description: 'Notification preferences updated',
    });
  };

  const handleSaveWhatsAppSettings = () => {
    toast({
      title: 'Success',
      description: 'WhatsApp settings updated',
    });
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: 'la_' + Math.random().toString(36).substring(2, 18),
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    setApiKeys([...apiKeys, newKey]);
    toast({
      title: 'API Key Generated',
      description: 'New API key has been created successfully',
    });
  };

  const deleteApiKey = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been removed',
      });
    }
  };

  const exportData = () => {
    // Mock data export
    const data = {
      profile: profileData,
      notifications,
      whatsappSettings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layanify-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Settings Exported',
      description: 'Your settings have been downloaded',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your account settings and preferences.
            </p>
          </div>
          <Button variant="outline" onClick={exportData} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Settings
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Database className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      placeholder="Your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                        <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                        <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>New Messages</Label>
                      <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                    </div>
                    <Switch
                      checked={notifications.newMessages}
                      onCheckedChange={(checked) => setNotifications({...notifications, newMessages: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Workflow Updates</Label>
                      <p className="text-sm text-muted-foreground">Notifications about workflow executions and errors</p>
                    </div>
                    <Switch
                      checked={notifications.workflowUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, workflowUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly analytics reports</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Important security notifications</p>
                    </div>
                    <Switch
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Settings */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Configuration</CardTitle>
                <CardDescription>
                  Configure WhatsApp-specific settings and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Auto Reply</Label>
                      <p className="text-sm text-muted-foreground">Automatically respond to incoming messages</p>
                    </div>
                    <Switch
                      checked={whatsappSettings.autoReply}
                      onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, autoReply: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Business Hours</Label>
                      <p className="text-sm text-muted-foreground">Only auto-respond during business hours</p>
                    </div>
                    <Switch
                      checked={whatsappSettings.businessHours}
                      onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, businessHours: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Read Receipts</Label>
                      <p className="text-sm text-muted-foreground">Send read receipts when messages are viewed</p>
                    </div>
                    <Switch
                      checked={whatsappSettings.readReceipts}
                      onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, readReceipts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label>Typing Indicator</Label>
                      <p className="text-sm text-muted-foreground">Show typing indicator when composing responses</p>
                    </div>
                    <Switch
                      checked={whatsappSettings.typingIndicator}
                      onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, typingIndicator: checked})}
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
                    />
                    <p className="text-sm text-muted-foreground">Delay before sending automated messages</p>
                  </div>
                </div>
                <Button onClick={handleSaveWhatsAppSettings}>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for external integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    API keys allow external applications to access your account
                  </p>
                  <Button onClick={generateApiKey} className="w-full sm:w-auto">
                    <Key className="mr-2 h-4 w-4" />
                    Generate New Key
                  </Button>
                </div>

                <div className="space-y-3">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-medium truncate">{apiKey.name}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {apiKey.key}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export, import, or delete your account data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Download all your conversations, contacts, and workflows
                    </p>
                    <Button variant="outline" className="mt-3 w-full sm:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Export All Data
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Import Data</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Import contacts and workflows from a CSV or JSON file
                    </p>
                    <Button variant="outline" className="mt-3 w-full sm:w-auto">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg border-red-200 bg-red-50">
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" className="mt-3 w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
