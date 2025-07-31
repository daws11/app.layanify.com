'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newMessages: boolean;
  workflowUpdates: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    newMessages: true,
    workflowUpdates: true,
    weeklyReports: false,
    securityAlerts: true,
  });

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement tRPC mutation for notification settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about important events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Messages</Label>
              <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
            </div>
            <Switch
              checked={notifications.newMessages}
              onCheckedChange={(checked) => setNotifications({...notifications, newMessages: checked})}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Workflow Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications about workflow executions and errors</p>
            </div>
            <Switch
              checked={notifications.workflowUpdates}
              onCheckedChange={(checked) => setNotifications({...notifications, workflowUpdates: checked})}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Receive weekly analytics reports</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Important security notifications</p>
            </div>
            <Switch
              checked={notifications.securityAlerts}
              onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})}
              disabled={isLoading}
            />
          </div>
        </div>
        <Button 
          onClick={handleSaveNotifications} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
} 