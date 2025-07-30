'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Phone, Edit2, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWhatsAppNumbers, useDataActions } from '@/hooks/use-data';
import { VerifyNumberDialog } from '@/components/whatsapp/verify-number-dialog';

// Tambahkan tipe WhatsAppNumber
interface WhatsAppNumber {
  id: string;
  number: string;
  displayName: string;
  status: string;
  createdAt: string;
}

export default function WhatsAppNumbersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState<WhatsAppNumber | null>(null);
  const [number, setNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [verifyingNumber, setVerifyingNumber] = useState<WhatsAppNumber | null>(null);

  // Fetch WhatsApp numbers
  const { numbers, loading: isLoading } = useWhatsAppNumbers();
  // Data actions
  const { addWhatsAppNumber, loading: actionLoading } = useDataActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNumber) {
      // Update logic (mock only supports add, so just close dialog)
      setIsDialogOpen(false);
      setEditingNumber(null);
      setNumber('');
      setDisplayName('');
    } else {
      await addWhatsAppNumber(number, displayName);
      setIsDialogOpen(false);
      setNumber('');
      setDisplayName('');
    }
  };

  const handleEdit = (numberData: WhatsAppNumber) => {
    setEditingNumber(numberData);
    setNumber(numberData.number);
    setDisplayName(numberData.displayName);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this WhatsApp number?')) {
      // Mock delete logic
      console.log('Deleting number with id:', id);
      // In a real app, you would call a delete action from useDataActions
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">WhatsApp Numbers</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your WhatsApp Business numbers and their verification status.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingNumber(null);
                  setNumber('');
                  setDisplayName('');
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Number
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingNumber ? 'Edit WhatsApp Number' : 'Add WhatsApp Number'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingNumber
                      ? 'Update the display name for your WhatsApp number.'
                      : 'Add a new WhatsApp Business number to your account.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {!editingNumber && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="number" className="sm:text-right">
                        Phone Number
                      </Label>
                      <Input
                        id="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="+1234567890"
                        className="sm:col-span-3"
                        required
                        pattern="^\+\d{10,15}$"
                        title="Enter phone number with country code (e.g., +1234567890)"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="displayName" className="sm:text-right">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Business Name"
                      className="sm:col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={actionLoading}
                  >
                    {editingNumber ? 'Update' : 'Add'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Numbers List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {numbers?.length === 0 ? (
              <div className="col-span-full">
                <Card className="text-center py-12">
                  <CardHeader>
                    <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
                    <CardTitle>No WhatsApp Numbers</CardTitle>
                    <CardDescription>
                      Get started by adding your first WhatsApp Business number.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ) : (
              numbers?.map((numberData) => (
                <Card key={numberData.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {getStatusIcon(numberData.status)}
                        <Badge className={getStatusColor(numberData.status)}>
                          <span className="hidden sm:inline">{numberData.status}</span>
                        </Badge>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(numberData)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(numberData.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p className="font-mono text-sm break-all">{numberData.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                        <p className="text-sm truncate">{numberData.displayName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Added</p>
                        <p className="text-sm">
                          {new Date(numberData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {numberData.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setVerifyingNumber(numberData)}
                        >
                          Verify Number
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
        
        {/* Verify Number Dialog */}
        {verifyingNumber && (
          <VerifyNumberDialog
            isOpen={!!verifyingNumber}
            onOpenChange={(open) => !open && setVerifyingNumber(null)}
            numberId={verifyingNumber?.id || ''}
            phoneNumber={verifyingNumber?.number || ''}
            onSuccess={() => {
              // No need to refetch here as useWhatsAppNumbers handles updates
              setVerifyingNumber(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
