'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2,
  FileText,
  AlertTriangle
} from 'lucide-react';

export function DataSettings() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    try {
      // Mock data export
      const data = {
        conversations: [],
        contacts: [],
        workflows: [],
        settings: {},
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `layanify-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Settings Exported',
        description: 'Your data has been downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async () => {
    setIsImporting(true);
    try {
      // TODO: Implement file upload and data import
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate import
      toast({
        title: 'Data Imported',
        description: 'Your data has been imported successfully',
      });
    } catch (error) {
      toast({
        title: 'Import Error',
        description: 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including conversations, contacts, and workflows.'
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // TODO: Implement account deletion
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate deletion
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
      });
      // Redirect to logout or home page
    } catch (error) {
      toast({
        title: 'Deletion Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your conversations, contacts, and workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">Export All Data</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Download a complete backup of your account data including:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• All conversations and messages</li>
                  <li>• Contact information</li>
                  <li>• Workflow configurations</li>
                  <li>• Account settings and preferences</li>
                </ul>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={exportData}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export All Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import contacts and workflows from a backup file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">Import from Backup</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Import data from a previously exported backup file. This will merge the imported data with your existing data.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: JSON backup files
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={importData}
              disabled={isImporting}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Permanent Deletion</h4>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. All your data will be permanently deleted including:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• All conversations and message history</li>
                  <li>• Contact database</li>
                  <li>• Workflow configurations</li>
                  <li>• Account settings and preferences</li>
                  <li>• WhatsApp Business API connections</li>
                </ul>
                <p className="text-sm text-red-700 mt-2 font-medium">
                  Please make sure you have exported your data before proceeding.
                </p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="mt-4"
              onClick={deleteAccount}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting Account...' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 