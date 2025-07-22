'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Workflow, 
  Edit2, 
  Trash2, 
  Play, 
  Pause, 
  Copy,
  Settings,
  MessageSquare,
  Clock,
  Zap
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // Fetch workflows
  const { data: workflows, isLoading, refetch } = trpc.workflow.getWorkflows.useQuery();

  // Mutations
  const createWorkflowMutation = trpc.workflow.createWorkflow.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Workflow created successfully',
      });
      setIsDialogOpen(false);
      setWorkflowName('');
      setWorkflowDescription('');
      refetch();
      // Navigate to workflow editor
      router.push(`/workflows/${data.workflow.id}/edit`);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const toggleWorkflowMutation = trpc.workflow.toggleWorkflow.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workflow status updated',
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

  const deleteWorkflowMutation = trpc.workflow.deleteWorkflow.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workflow deleted successfully',
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

  const duplicateWorkflowMutation = trpc.workflow.duplicateWorkflow.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workflow duplicated successfully',
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

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowName.trim()) return;

    createWorkflowMutation.mutate({
      name: workflowName.trim(),
      triggers: ['message.incoming'], // Default trigger
    });
  };

  const handleToggleWorkflow = (id: string, isActive: boolean) => {
    toggleWorkflowMutation.mutate({ id, isActive: !isActive });
  };

  const handleDeleteWorkflow = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteWorkflowMutation.mutate({ id });
    }
  };

  const handleDuplicateWorkflow = (id: string, name: string) => {
    const newName = `${name} (Copy)`;
    duplicateWorkflowMutation.mutate({ id, name: newName });
  };

  const workflowTemplates = [
    {
      name: 'Welcome Message',
      description: 'Send automated welcome messages to new contacts',
      icon: MessageSquare,
      triggers: ['contact.new'],
    },
    {
      name: 'Auto Response',
      description: 'Respond to common questions automatically',
      icon: Zap,
      triggers: ['message.incoming'],
    },
    {
      name: 'Follow Up',
      description: 'Send follow-up messages after a delay',
      icon: Clock,
      triggers: ['message.sent'],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground">
              Automate your WhatsApp conversations with AI-powered workflows.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateWorkflow}>
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>
                    Give your workflow a name and description to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="My Awesome Workflow"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="What does this workflow do?"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createWorkflowMutation.isLoading}
                  >
                    {createWorkflowMutation.isLoading ? 'Creating...' : 'Create & Edit'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Templates */}
        <div className="grid gap-4 md:grid-cols-3">
          {workflowTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setWorkflowName(template.name);
                      setWorkflowDescription(template.description);
                      setIsDialogOpen(true);
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Workflows List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Workflows</CardTitle>
            <CardDescription>
              Manage and monitor your automated workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : workflows?.length === 0 ? (
              <div className="text-center py-12">
                <Workflow className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No workflows yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first workflow to start automating conversations.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {workflows?.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Workflow className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {workflow.nodeCount} nodes
                          </Badge>
                          <Badge 
                            variant={workflow.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {workflow.triggers?.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              • Triggers: {workflow.triggers.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Active/Inactive Toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
                          disabled={toggleWorkflowMutation.isLoading}
                        />
                        <span className="text-xs text-muted-foreground">
                          {workflow.isActive ? 'On' : 'Off'}
                        </span>
                      </div>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/workflows/${workflow.id}/edit`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateWorkflow(workflow.id, workflow.name)}
                        disabled={duplicateWorkflowMutation.isLoading}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                        disabled={deleteWorkflowMutation.isLoading}
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
      </div>
    </DashboardLayout>
  );
}
