'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  isVisible?: boolean;
}

export function SecuritySettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { 
      id: '1', 
      name: 'Production API', 
      key: 'la_••••••••••••••••••', 
      created: '2024-01-15', 
      lastUsed: '2 hours ago',
      isVisible: false
    },
    { 
      id: '2', 
      name: 'Development API', 
      key: 'la_••••••••••••••••••', 
      created: '2024-01-10', 
      lastUsed: '5 days ago',
      isVisible: false
    }
  ]);

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: 'la_' + Math.random().toString(36).substring(2, 18),
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      isVisible: true
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

  const toggleKeyVisibility = (keyId: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === keyId 
        ? { ...key, isVisible: !key.isVisible }
        : key
    ));
  };

  const copyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast({
        title: 'Copied',
        description: 'API key copied to clipboard',
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy API key',
        variant: 'destructive',
      });
    }
  };

  const getDisplayKey = (key: ApiKey) => {
    if (key.isVisible) {
      return key.key;
    }
    return key.key.replace(/./g, '•');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Manage your API keys for external integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            API keys allow external applications to access your account
          </p>
          <Button onClick={generateApiKey} disabled={isLoading}>
            <Key className="mr-2 h-4 w-4" />
            Generate New Key
          </Button>
        </div>

        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{apiKey.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {getDisplayKey(apiKey)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="h-8 w-8"
                >
                  {apiKey.isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {apiKey.isVisible && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyApiKey(apiKey.key)}
                    className="h-8 w-8"
                  >
                    {copiedKey === apiKey.key ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteApiKey(apiKey.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {apiKeys.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No API keys found</p>
            <p className="text-sm">Generate your first API key to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 