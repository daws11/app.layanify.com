'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { SettingsTabs } from '@/components/settings/settings-tabs';
import { Download } from 'lucide-react';

export default function SettingsPage() {
  const exportData = () => {
    // Mock data export
    const data = {
      profile: {},
      notifications: {},
      whatsappSettings: {},
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layanify-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Settings
          </Button>
        </div>

        {/* Settings Tabs */}
        <SettingsTabs />
      </div>
    </DashboardLayout>
  );
}
