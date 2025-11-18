import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const conversionData = [
  { month: 'Jan', leads: 120, converted: 45 },
  { month: 'Feb', leads: 150, converted: 60 },
  { month: 'Mar', leads: 180, converted: 72 },
  { month: 'Apr', leads: 160, converted: 68 },
  { month: 'May', leads: 200, converted: 85 },
  { month: 'Jun', leads: 220, converted: 95 },
];

const channelActivity = [
  { channel: 'WhatsApp', messages: 450 },
  { channel: 'Email', messages: 320 },
  { channel: 'Messenger', messages: 280 },
  { channel: 'Web Chat', messages: 190 },
];

export default function Analytics() {
  return (
    <>
      <Helmet>
        <title>Analytics - CRM Platform</title>
        <meta name="description" content="View detailed analytics and insights about your business performance." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Reports</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channel Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}