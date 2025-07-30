'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Workflow, Users, Plus, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useDashboardStats, useWhatsAppNumbers } from '@/hooks/use-data';
import { DemoModeBanner } from '@/components/demo-mode-banner';
import Link from 'next/link';

export default function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { numbers, loading: numbersLoading } = useWhatsAppNumbers();
  
  // Calculate stats dari data yang ada
  const dashboardStats = stats ? {
    totalConversations: stats.totalConversations,
    activeConversations: stats.activeConversations,
    whatsappNumbers: stats.whatsappNumbers,
    activeWorkflows: stats.activeWorkflows,
  } : null;
  
  const statCards = [
    {
      title: 'WhatsApp Numbers',
      value: dashboardStats?.whatsappNumbers || 0,
      icon: Phone,
      description: 'Active business numbers',
      href: '/whatsapp',
    },
    {
      title: 'Active Conversations',
      value: dashboardStats?.activeConversations || 0,
      icon: MessageSquare,
      description: 'Ongoing conversations',
      href: '/conversations',
    },
    {
      title: 'Active Workflows',
      value: dashboardStats?.activeWorkflows || 0,
      icon: Workflow,
      description: 'Automated workflows',
      href: '/workflows',
    },
    {
      title: 'Total Conversations',
      value: dashboardStats?.totalConversations || 0,
      icon: Users,
      description: 'All conversations',
      href: '/contacts',
    },
  ];

  return (
    <DashboardLayout>
      {/* <DemoModeBanner /> */}
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome to your WhatsApp Business CRM. Here's an overview of your account.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/whatsapp">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add WhatsApp Number
                </Button>
              </Link>
              <Link href="/workflows">
                <Button variant="outline" className="w-full justify-start">
                  <Workflow className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </Link>
              <Link href="/conversations">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Conversations
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* WhatsApp Numbers Status */}
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Numbers</CardTitle>
              <CardDescription>Status of your business numbers</CardDescription>
            </CardHeader>
            <CardContent>
              {numbersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : numbers && numbers.length > 0 ? (
                <div className="space-y-3">
                  {numbers.slice(0, 3).map((number) => (
                    <div key={number.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-mono truncate">{number.number}</span>
                      </div>
                      <Badge 
                        variant={number.status === 'approved' ? 'default' : 'secondary'}
                        className={`${number.status === 'approved' ? 'bg-green-100 text-green-800' : ''} flex-shrink-0`}
                      >
                        {number.status === 'approved' ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        <span className="hidden sm:inline">{number.status}</span>
                      </Badge>
                    </div>
                  ))}
                  {numbers.length > 3 && (
                    <Link href="/whatsapp">
                      <Button variant="ghost" size="sm" className="w-full">
                        View all {numbers.length} numbers
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Phone className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No WhatsApp numbers added yet
                  </p>
                  <Link href="/whatsapp">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Number
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <div className="text-sm min-w-0 flex-1">
                    <p className="font-medium">System initialized</p>
                    <p className="text-muted-foreground text-xs">Welcome to Layanify CRM</p>
                  </div>
                </div>
                {numbers && numbers.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <div className="text-sm min-w-0 flex-1">
                      <p className="font-medium">WhatsApp numbers configured</p>
                      <p className="text-muted-foreground text-xs">
                        {numbers.length} number{numbers.length > 1 ? 's' : ''} added
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
