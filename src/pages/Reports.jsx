import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart 
} from 'recharts';
import { 
  Download, Calendar, Filter, Brain, TrendingUp, Users, MapPin, 
  Smartphone, AlertCircle, ArrowUpRight, ArrowDownRight, Loader2, ChevronDown 
} from 'lucide-react';

// --- INLINE UI COMPONENTS ---

const Card = ({ className, children }) => (
  <div className={`rounded-lg border bg-slate-900 border-slate-800 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={className}>
    {children}
  </div>
);

const Badge = ({ className, children }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${className}`}>
    {children}
  </div>
);

const Button = ({ className, variant = "default", size = "default", onClick, disabled, children }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    ghost: "hover:bg-slate-800 text-slate-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    icon: "h-9 w-9"
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

// --- MOCK DATA ---

// 1. Overview Data (All Agents)
const allAgentsPerformance = [
  { name: 'Ramesh', leads: 45, converted: 12, value: 85000 },
  { name: 'Suresh', leads: 38, converted: 8, value: 52000 },
  { name: 'Sundhar', leads: 52, converted: 15, value: 102000 },
  { name: 'Priya', leads: 30, converted: 6, value: 41000 },
  { name: 'John', leads: 25, converted: 4, value: 28000 },
];

// 2. Individual Agent Progress Data (Mock generator based on month)
const getIndividualProgress = (agentName) => [
  { name: 'Week 1', leads: Math.floor(Math.random() * 15) + 5, converted: Math.floor(Math.random() * 5) },
  { name: 'Week 2', leads: Math.floor(Math.random() * 20) + 5, converted: Math.floor(Math.random() * 8) },
  { name: 'Week 3', leads: Math.floor(Math.random() * 25) + 10, converted: Math.floor(Math.random() * 10) },
  { name: 'Week 4', leads: Math.floor(Math.random() * 30) + 10, converted: Math.floor(Math.random() * 12) },
];

const siteWiseData = [
  { name: 'Ganas Enclave', value: 35 },
  { name: 'Spring Fields', value: 45 },
  { name: 'Bhumi Residency', value: 20 },
];

const sourceData = [
  { name: 'Facebook', value: 120 },
  { name: 'Instagram', value: 85 },
  { name: '99acres', value: 60 },
  { name: 'Website', value: 45 },
  { name: 'Referral', value: 30 },
  { name: 'Walk-in', value: 15 },
];

const monthlyTrendData = [
  { name: 'Week 1', leads: 20, sales: 2 },
  { name: 'Week 2', leads: 35, sales: 5 },
  { name: 'Week 3', leads: 50, sales: 8 },
  { name: 'Week 4', leads: 65, sales: 12 },
];

const AGENTS_LIST = ['All Agents', 'Ramesh', 'Suresh', 'Sundhar', 'Priya', 'John'];
const MONTHS_LIST = ['Nov 2025', 'Oct 2025', 'Sep 2025', 'Aug 2025'];
const COLORS = ['#d946ef', '#8b5cf6', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b'];

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-md shadow-xl text-slate-100">
        <p className="font-semibold mb-1 text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- AI INSIGHT CARD ---
const InsightCard = ({ title, value, trend, trendValue, icon: Icon, insight }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className="p-2 bg-slate-800 rounded-lg text-fuchsia-500">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {trend === 'up' ? (
          <span className="text-green-500 text-xs flex items-center font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" /> {trendValue}
          </span>
        ) : (
          <span className="text-red-500 text-xs flex items-center font-medium">
            <ArrowDownRight className="w-3 h-3 mr-1" /> {trendValue}
          </span>
        )}
        <span className="text-slate-500 text-xs">vs last month</span>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex gap-2 items-start">
          <Brain className="w-3 h-3 text-fuchsia-500 mt-1 shrink-0" />
          <p className="text-xs text-slate-400 italic leading-relaxed">"{insight}"</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Reports() {
  const [loading, setLoading] = useState(true);
  
  // --- STATE FOR AGENT PERFORMANCE ---
  const [selectedAgent, setSelectedAgent] = useState('All Agents');
  const [selectedMonth, setSelectedMonth] = useState('Nov 2025');
  const [chartData, setChartData] = useState(allAgentsPerformance);

  // Simulate API loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Update chart data when filters change
  useEffect(() => {
    if (selectedAgent === 'All Agents') {
      setChartData(allAgentsPerformance);
    } else {
      // Logic to fetch specific agent data for specific month
      // Here we use mock data generator
      setChartData(getIndividualProgress(selectedAgent));
    }
  }, [selectedAgent, selectedMonth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-fuchsia-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-fuchsia-600 w-8 h-8" />
            Monthly Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered insights and performance metrics.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="text-slate-300">
            <Calendar className="w-4 h-4 mr-2" />
            {selectedMonth}
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI & AI INSIGHTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard 
          title="Total Leads" 
          value="355" 
          trend="up" 
          trendValue="+12.5%" 
          icon={Users}
          insight="Lead volume is surging. Sundays generate 20% more inquiries than weekdays."
        />
        <InsightCard 
          title="Conversion Rate" 
          value="8.2%" 
          trend="down" 
          trendValue="-1.4%" 
          icon={TrendingUp}
          insight="Conversions dropped slightly. Consider retraining agents on 'Follow-up' scripts."
        />
        <InsightCard 
          title="Top Source" 
          value="Facebook" 
          trend="up" 
          trendValue="+5.2%" 
          icon={Smartphone}
          insight="Facebook Luxury Villa campaign has the highest ROI this month."
        />
        <InsightCard 
          title="Top Site" 
          value="Spring Fields" 
          trend="up" 
          trendValue="+8.0%" 
          icon={MapPin}
          insight="Spring Fields site visits have doubled after the recent open house event."
        />
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. AGENT PERFORMANCE (Dynamic Chart) */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            
            {/* --- CONTROLS HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedAgent === 'All Agents' ? 'Agent Comparison' : `${selectedAgent}'s Progress`}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedAgent === 'All Agents' ? 'Leads Assigned vs. Converted' : `Weekly performance for ${selectedMonth}`}
                </p>
              </div>
              
              <div className="flex gap-2">
                {/* Agent Selector */}
                <div className="relative">
                  <select 
                    className="h-9 rounded-md border border-slate-700 bg-slate-800 pl-3 pr-8 text-xs text-slate-100 focus:border-fuchsia-500 focus:outline-none appearance-none cursor-pointer"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                  >
                    {AGENTS_LIST.map(agent => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Month Selector */}
                <div className="relative">
                  <select 
                    className="h-9 rounded-md border border-slate-700 bg-slate-800 pl-3 pr-8 text-xs text-slate-100 focus:border-fuchsia-500 focus:outline-none appearance-none cursor-pointer"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* --- CHART AREA --- */}
            <div className="h-[300px] w-full transition-all duration-500">
              <ResponsiveContainer width="100%" height="100%">
                {selectedAgent === 'All Agents' ? (
                  // VIEW 1: All Agents (Bar Chart)
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="leads" fill="#334155" name="Assigned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="converted" fill="#d946ef" name="Converted" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  // VIEW 2: Individual Agent (Trend Chart)
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="leads" name="Leads Assigned" stroke="#d946ef" fillOpacity={1} fill="url(#colorLeads)" />
                    <Line type="monotone" dataKey="converted" name="Converted" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* AI Insight Footer */}
            <div className="mt-4 p-3 bg-slate-950/50 rounded border border-slate-800 flex gap-2">
              <AlertCircle className="w-4 h-4 text-fuchsia-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300">
                <span className="font-bold text-fuchsia-400">AI Insight:</span> 
                {selectedAgent === 'All Agents' 
                  ? " Sundhar has the highest conversion ratio (28%). Consider assigning high-value leads to him." 
                  : ` ${selectedAgent} showed a 15% increase in conversions during Week 3 of ${selectedMonth}. Consistency is improving.`
                }
              </p>
            </div>

          </CardContent>
        </Card>

        {/* 2. SITE WISE DISTRIBUTION (Pie Chart) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-1">Site Distribution</h3>
            <p className="text-xs text-slate-400 mb-6">Where are the inquiries coming from?</p>
            
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={siteWiseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {siteWiseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-white">3</span>
                  <span className="text-xs text-slate-400">Active Sites</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {siteWiseData.map((entry, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-slate-300">{entry.name}</span>
                  </div>
                  <span className="font-medium text-white">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* SECONDARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 3. LEAD SOURCE ANALYSIS (Area Chart) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Lead Sources Overview</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 12}} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-slate-950/50 rounded border border-slate-800 flex gap-2">
               <Brain className="w-4 h-4 text-fuchsia-500 mt-0.5 shrink-0" />
               <p className="text-xs text-slate-300">
                 <span className="font-bold text-fuchsia-400">Strategy:</span> Digital ads (FB/Insta) account for 60% of leads. Walk-ins are low. Recommend launching a local 'Open House' event to boost physical visits.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. WEEKLY TREND (Line Chart) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Weekly Lead Velocity</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="leads" stroke="#d946ef" fillOpacity={1} fill="url(#colorLeads)" />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{r: 4}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400 px-2">
               <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-fuchsia-500 rounded-sm inline-block"></span> Leads Received
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span> Sales Closed
               </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}