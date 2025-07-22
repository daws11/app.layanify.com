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
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { VerifyNumberDialog } from '@/components/whatsapp/verify-number-dialog';

export default function WhatsAppNumbersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState<any>(null);
  const [number, setNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [verifyingNumber, setVerifyingNumber] = useState<any>(null);
  const { toast } = useToast();

  // Fetch WhatsApp numbers
  const { data: numbers, isLoading, refetch } = trpc.whatsapp.getNumbers.useQuery();

  // Mutations
  const addNumberMutation = trpc.whatsapp.addNumber.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'WhatsApp number added successfully',
      });
      setIsDialogOpen(false);
      setNumber('');
      setDisplayName('');
      refetch();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const updateNumberMutation = trpc.whatsapp.updateNumber.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'WhatsApp number updated successfully',
      });
      setIsDialogOpen(false);
      setEditingNumber(null);
      setNumber('');
      setDisplayName('');
      refetch();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const deleteNumberMutation = trpc.whatsapp.deleteNumber.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'WhatsApp number deleted successfully',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNumber) {
      updateNumberMutation.mutate({
        id: editingNumber.id,
        displayName,
      });
    } else {
      addNumberMutation.mutate({
        number,
        displayName,
      });
    }
  };

  const handleEdit = (numberData: any) => {
    setEditingNumber(numberData);
    setNumber(numberData.number);
    setDisplayName(numberData.displayName);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this WhatsApp number?')) {
      deleteNumberMutation.mutate({ id });
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WhatsApp Numbers</h1>
            <p className="text-muted-foreground">
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
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Number
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="number" className="text-right">
                        Phone Number
                      </Label>
                      <Input
                        id="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="+1234567890"
                        className="col-span-3"
                        required
                        pattern="^\+\d{10,15}$"
                        title="Enter phone number with country code (e.g., +1234567890)"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="displayName" className="text-right">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Business Name"
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={addNumberMutation.isLoading || updateNumberMutation.isLoading}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(numberData.status)}
                        <Badge className={getStatusColor(numberData.status)}>
                          {numberData.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
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
                          disabled={deleteNumberMutation.isLoading}
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
                        <p className="font-mono text-sm">{numberData.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                        <p className="text-sm">{numberData.displayName}</p>
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
            numberId={verifyingNumber.id}
            phoneNumber={verifyingNumber.number}
            onSuccess={() => {
              refetch();
              setVerifyingNumber(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
