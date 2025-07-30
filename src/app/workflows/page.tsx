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
  Copy,
  MessageSquare,
  Clock,
  Zap
} from 'lucide-react';
import { useWorkflows, useDataActions } from '@/hooks/use-data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // Fetch workflows
  const { workflows, loading: isLoading } = useWorkflows();
  // Data actions
  const { createWorkflow, updateWorkflowStatus, loading: actionLoading } = useDataActions();

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowName.trim()) return;
    await createWorkflow({ name: workflowName.trim(), triggers: ['message.incoming'] });
    setIsDialogOpen(false);
    setWorkflowName('');
    setWorkflowDescription('');
    // No explicit refetch needed, useWorkflows will update on reload
  };

  const handleToggleWorkflow = async (id: string, isActive: boolean) => {
    await updateWorkflowStatus(id, !isActive);
  };

  const handleDeleteWorkflow = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      // This mutation is not yet implemented in useDataActions, so we'll keep the original logic
      // For now, we'll just show a toast and not update the UI immediately
      toast({
        title: 'Success',
        description: 'Workflow deletion is not yet implemented.',
      });
    }
  };

  const handleDuplicateWorkflow = () => {
    toast({
      title: 'Success',
      description: 'Workflow duplication is not yet implemented.',
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Automate your WhatsApp conversations with AI-powered workflows.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleCreateWorkflow}>
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>
                    Give your workflow a name and description to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="sm:text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="My Awesome Workflow"
                      className="sm:col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="sm:text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="What does this workflow do?"
                      className="sm:col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Creating...' : 'Create & Edit'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Templates */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {workflowTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-base truncate">{template.name}</CardTitle>
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
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4"
                  >
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                        <Workflow className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{workflow.name}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {workflow.nodeCount} nodes
                            </Badge>
                            <Badge 
                              variant={workflow.isActive ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {workflow.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {workflow.triggers?.length > 0 && (
                            <span className="text-xs text-muted-foreground truncate">
                              • Triggers: {workflow.triggers.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                      {/* Active/Inactive Toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
                          disabled={actionLoading}
                        />
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {workflow.isActive ? 'On' : 'Off'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
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
                          onClick={() => handleDuplicateWorkflow()}
                          disabled={actionLoading}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
