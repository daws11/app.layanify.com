'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  Zap, 
  Shield, 
  Database 
} from 'lucide-react';
import { ProfileSettings } from './profile-settings';
import { NotificationSettings } from './notification-settings';
import { WhatsAppSettings } from './whatsapp-settings';
import { SecuritySettings } from './security-settings';
import { DataSettings } from './data-settings';

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="whatsapp" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          WhatsApp
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileSettings />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <NotificationSettings />
      </TabsContent>

      <TabsContent value="whatsapp" className="space-y-6">
        <WhatsAppSettings />
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <SecuritySettings />
      </TabsContent>

      <TabsContent value="data" className="space-y-6">
        <DataSettings />
      </TabsContent>
    </Tabs>
  );
} 