import React, { useEffect, useState } from 'react';
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
import { config } from "@/components/CustomComponents/config.js";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';




// const leadsBySource = [
//   { name: 'Website', value: 400 },
//   { name: 'Referral', value: 300 },
//   { name: 'Social Media', value: 200 },
//   { name: 'Direct', value: 150 },
// ];



const COLORS = ['#f472b6', '#a78bfa', '#2dd4bf', '#fbbf24']; // Pink, purple, teal, amber

// const recentActivities = [
//   { id: 1, type: 'lead', message: 'New lead added: John Doe', time: '5 min ago', icon: Users },
//   { id: 2, type: 'call', message: 'Call completed with Sarah Smith', time: '15 min ago', icon: Phone },
//   { id: 3, type: 'task', message: 'Task completed: Follow-up email', time: '1 hour ago', icon: CheckCircle },
//   { id: 4, type: 'message', message: 'New message from WhatsApp', time: '2 hours ago', icon: MessageSquare },
// ];



export default function Dashboard() {


  const initialState = {
    lead: '',
    callog: '',

  }
  const [states, setStates] = useState(initialState)
  const [callDays, setCallDays] = useState([])
  const [dashboard, setDashBoard] = useState([])
  const [leadSource, setLeadSource] = useState([]);
  const isMobile = window.innerWidth < 768


  const statsData = [
    { label: 'Total Leads', value: states.lead, icon: Users, color: 'bg-fuchsia-500' },
    { label: 'Today Calls ', value: states.callog, icon: Phone, color: 'bg-emerald-500' },
    // { label: 'Messages', value: '456', change: '+23%', icon: MessageSquare, color: 'bg-indigo-500' },
    { label: 'Conversion Rate', value: '34%', icon: TrendingUp, color: 'bg-amber-500' },
  ];


  // const callStats = [
  //   { day: 'Mon', calls: states.callog },
  //   { day: 'Tue', calls:states.callog},
  //   { day: 'Wed', calls: states.callog},
  //   { day: 'Thu', calls: states.callog },
  //   { day: 'Fri', calls: states.callog },
  //   { day: 'Sat', calls: states.callog},
  //   { day: 'Sun', calls: states.callog },

  // ];




  useEffect(() => {
    getAllDashBoard()
    getDayWiseAnsweredCalls()
    getLeadsBySource()
  }, [])

  const getAllDashBoard = async () => {
    try {

      let url = config.Api + "DashBoard/getAllDashBoard";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await res.json();
      const data = result.data || result;

      setDashBoard(data);
      setStates(data)

    } catch (err) {
      console.log(err, "err")
    }
  };

  const getDayWiseAnsweredCalls = async () => {
    try {

      let url = config.Api + "DashBoard/getDayWiseAnsweredCalls";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await res.json();
      const data = result.data || result;


      setCallDays(data)


    } catch (err) {
      console.log(err, "err")
    }
  };



  const getLeadsBySource = async () => {
    try {

      let url = config.Api + "DashBoard/getLeadsBySource";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await res.json();
      const data = result.data || result;


      setLeadSource(data)


    } catch (err) {
      console.log(err, "err")
    }
  };


  return (
    <>
      <Helmet>
        <title>Dashboard - ENIS CRM</title>
        <meta name="description" content="View your ENIS CRM dashboard with key metrics, analytics, and recent activities." />
      </Helmet>
      <div className="space-y-6 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <BarChart data={callDays}>
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
            <CardHeader className='md:max-w-full max-w-md'>
              <CardTitle>Leads by Source</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                <PieChart>
                  <Pie
                    data={leadSource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={!isMobile ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                    outerRadius={100} // Slightly larger pie
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadSource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#2a133b', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>

              {/*  MOBILE LEGEND */}
              {isMobile && (
                <div className="mt-3 flex flex-wrap gap-3 justify-center">
                  {leadSource.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* <Card>
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
        </Card> */}
      </div>
    </>
  );
}