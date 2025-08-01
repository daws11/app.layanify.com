'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Mail,
  Calendar,
  Tag,
  Edit2,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContacts } from '@/hooks/use-data';

// Tambahkan tipe Contact
interface Contact {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  tags: string[];
  lastContact: Date;
  status: string;
  notes: string;
  source?: string;
}

export default function ContactsPage() {
  const { contacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    tags: [] as string[]
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      (contact.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      contact.phone.includes(searchQuery) ||
      (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone: contact.phone,
        email: contact.email || '',
        notes: contact.notes,
        tags: contact.tags
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        notes: '',
        tags: []
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleSaveContact = () => {
    // In real app, this would make tRPC call
    toast({
      title: 'Success',
      description: isEditing ? 'Contact updated successfully' : 'Contact created successfully',
    });
    setIsDialogOpen(false);
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    if (confirm(`Are you sure you want to delete ${contactName || 'this contact'}?`)) {
      // In real app, this would make tRPC call
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'opted-out':
        return 'bg-red-100 text-red-800';
      case 'blocked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your WhatsApp contacts and customer information.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{contacts.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {contacts.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opted Out</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {contacts.filter(c => c.status === 'opted-out').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {contacts.filter(c => {
                  const thisMonth = new Date();
                  return c.lastContact.getMonth() === thisMonth.getMonth();
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Contacts</CardTitle>
              <Badge variant="secondary">{filteredContacts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="opted-out">Opted Out</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contacts List */}
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  {searchQuery || filterStatus !== 'all' ? 'No contacts found' : 'No contacts yet'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Start by adding your first contact or connect a WhatsApp number.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4"
                  >
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <Avatar className="flex-shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {contact.name?.charAt(0)?.toUpperCase() || contact.phone.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="font-medium truncate">
                            {contact.name || 'Unnamed Contact'}
                          </h4>
                          <Badge className={getStatusColor(contact.status)} variant="secondary">
                            {contact.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{contact.phone}</span>
                          </span>
                          {contact.email && (
                            <span className="flex items-center">
                              <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{contact.email}</span>
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            {contact.lastContact.toLocaleDateString()}
                          </span>
                        </div>
                        
                        {contact.tags.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            <Tag className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // Navigate to conversation
                          toast({
                            title: 'Opening conversation',
                            description: `Starting chat with ${contact.name || contact.phone}`,
                          });
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(contact)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Contact Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Contact' : 'Add New Contact'}
              </DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Update contact information and preferences.'
                  : 'Add a new contact to your WhatsApp CRM.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contact name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+628123456789"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contact@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about this contact..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveContact}>
                {isEditing ? 'Update' : 'Create'} Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
