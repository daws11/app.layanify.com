'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

// Mock data for analytics
const mockAnalytics = {
  overview: {
    totalMessages: 1247,
    totalConversations: 89,
    activeContacts: 156,
    responseRate: 94.2,
    avgResponseTime: '2.3 min',
    totalWorkflows: 12
  },
  trends: {
    messages: {
      current: 1247,
      previous: 1089,
      change: 14.5
    },
    conversations: {
      current: 89,
      previous: 76,
      change: 17.1
    },
    responseRate: {
      current: 94.2,
      previous: 91.8,
      change: 2.6
    }
  },
  messageTypes: [
    { type: 'Text', count: 890, percentage: 71.4 },
    { type: 'Template', count: 245, percentage: 19.6 },
    { type: 'Media', count: 89, percentage: 7.1 },
    { type: 'Document', count: 23, percentage: 1.9 }
  ],
  topWorkflows: [
    { name: 'Welcome Message', executions: 156, success: 98.1 },
    { name: 'Auto Response', executions: 89, success: 94.4 },
    { name: 'Follow Up', executions: 67, success: 91.0 },
    { name: 'Order Confirmation', executions: 45, success: 97.8 }
  ],
  dailyActivity: [
    { date: '2024-01-15', messages: 87, conversations: 12 },
    { date: '2024-01-16', messages: 95, conversations: 15 },
    { date: '2024-01-17', messages: 123, conversations: 18 },
    { date: '2024-01-18', messages: 89, conversations: 11 },
    { date: '2024-01-19', messages: 156, conversations: 22 },
    { date: '2024-01-20', messages: 134, conversations: 19 },
    { date: '2024-01-21', messages: 98, conversations: 14 }
  ]
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('messages');

  const getTrendIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const exportData = () => {
    // In real app, this would generate and download a CSV/Excel file
    const data = JSON.stringify(mockAnalytics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your WhatsApp performance and engagement metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.totalMessages.toLocaleString()}</div>
              <div className="flex items-center text-sm">
                {getTrendIcon(mockAnalytics.trends.messages.change)}
                <span className={`ml-1 ${getTrendColor(mockAnalytics.trends.messages.change)}`}>
                  {Math.abs(mockAnalytics.trends.messages.change)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.totalConversations}</div>
              <div className="flex items-center text-sm">
                {getTrendIcon(mockAnalytics.trends.conversations.change)}
                <span className={`ml-1 ${getTrendColor(mockAnalytics.trends.conversations.change)}`}>
                  {Math.abs(mockAnalytics.trends.conversations.change)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.responseRate}%</div>
              <div className="flex items-center text-sm">
                {getTrendIcon(mockAnalytics.trends.responseRate.change)}
                <span className={`ml-1 ${getTrendColor(mockAnalytics.trends.responseRate.change)}`}>
                  {Math.abs(mockAnalytics.trends.responseRate.change)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                Average time to respond
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Message Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Message Types</CardTitle>
              <CardDescription>
                Distribution of message types sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAnalytics.messageTypes.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">{type.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{type.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {type.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Top Workflows</CardTitle>
              <CardDescription>
                Most executed workflows and their success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.topWorkflows.map((workflow, index) => (
                  <div key={workflow.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{workflow.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {workflow.executions} executions
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={workflow.success >= 95 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {workflow.success}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>
              Messages and conversations over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.dailyActivity.map((day) => (
                <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-24">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{day.messages} messages</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{day.conversations} conversations</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(day.messages / 200) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
            <CardDescription>
              AI-powered insights to improve your WhatsApp performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Great Response Rate!</h4>
                  <p className="text-sm text-green-700">
                    Your response rate of 94.2% is above average. Keep up the great work!
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Peak Activity Hours</h4>
                  <p className="text-sm text-blue-700">
                    Most of your conversations happen between 2-4 PM. Consider scheduling your workflows during this time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-yellow-50">
                <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Template Usage</h4>
                  <p className="text-sm text-yellow-700">
                    Template messages make up 19.6% of your messages. Consider creating more templates to improve efficiency.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
