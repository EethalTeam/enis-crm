import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Users,
  Phone,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statsData = [
  { label: 'Total Leads', value: '1,234', change: '+12%', icon: Users, color: 'bg-fuchsia-500' },
  { label: 'Calls Today', value: '89', change: '+8%', icon: Phone, color: 'bg-emerald-500' },
  { label: 'Messages', value: '456', change: '+23%', icon: MessageSquare, color: 'bg-indigo-500' },
  { label: 'Conversion Rate', value: '34%', change: '+5%', icon: TrendingUp, color: 'bg-amber-500' },
];

const leadsBySource = [
  { name: 'Website', value: 400 },
  { name: 'Referral', value: 300 },
  { name: 'Social Media', value: 200 },
  { name: 'Direct', value: 150 },
];

const callStats = [
  { day: 'Mon', calls: 45 },
  { day: 'Tue', calls: 52 },
  { day: 'Wed', calls: 48 },
  { day: 'Thu', calls: 61 },
  { day: 'Fri', calls: 55 },
  { day: 'Sat', calls: 38 },
  { day: 'Sun', calls: 42 },
];

const COLORS = ['#f472b6', '#a78bfa', '#2dd4bf', '#fbbf24']; // Pink, purple, teal, amber

const recentActivities = [
  { id: 1, type: 'lead', message: 'New lead added: John Doe', time: '5 min ago', icon: Users },
  { id: 2, type: 'call', message: 'Call completed with Sarah Smith', time: '15 min ago', icon: Phone },
  { id: 3, type: 'task', message: 'Task completed: Follow-up email', time: '1 hour ago', icon: CheckCircle },
  { id: 4, type: 'message', message: 'New message from WhatsApp', time: '2 hours ago', icon: MessageSquare },
];

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard - ENIS CRM</title>
        <meta name="description" content="View your ENIS CRM dashboard with key metrics, analytics, and recent activities." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <p className="text-sm text-green-400 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Calls This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={callStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a235a" /> {/* Darker grid */}
                  <XAxis dataKey="day" stroke="#a78bfa" />
                  <YAxis stroke="#a78bfa" />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#2a133b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="calls" fill="#f472b6" /> {/* Pink bar */}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadsBySource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100} // Slightly larger pie
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#2a133b', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: activity.id * 0.08 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-900/40 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full flex items-center justify-center">
                    <activity.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.message}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}