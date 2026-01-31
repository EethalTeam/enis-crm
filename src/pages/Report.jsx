import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import {
    Upload, Calendar, Filter, Brain, TrendingUp, Users, MapPin,
    Smartphone, AlertCircle, ArrowUpRight, ArrowDownRight, Loader2, ChevronDown, BarChart3
} from 'lucide-react';

import { config } from "@/components/CustomComponents/config.js";
import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { IconButton, Popover, Box } from "@mui/material";
import * as XLSX from "xlsx";
const decode = (value) => {
    if (!value) return "";
    try {
        return atob(value);
    } catch (err) {
        console.error("Decode failed:", err);
        return "";
    }
};

// --- INLINE UI COMPONENTS ---

// const Card = ({ className, children }) => (
//     <div className={`rounded-lg border bg-slate-900 border-slate-800 shadow-sm ${className}`}>
//         {children}
//     </div>
// );

const Card = ({ className, children }) => (
    <div
        className={`
      rounded-xl
      bg-gradient-to-br from-slate-900/90 to-slate-800/70
      border border-slate-700/40
      backdrop-blur-md
      shadow-lg
      hover:shadow-xl
      transition-all duration-300
      ${className}
    `}
    >
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

// const sourceData = [
//   { name: 'Facebook', value: 120 },
//   { name: 'Instagram', value: 85 },
//   { name: '99acres', value: 60 },
//   { name: 'Website', value: 45 },
//   { name: 'Referral', value: 30 },
//   { name: 'Walk-in', value: 15 },
// ];

const monthlyTrendData = [
    { name: 'Week 1', leads: 20, sales: 2 },
    { name: 'Week 2', leads: 35, sales: 5 },
    { name: 'Week 3', leads: 50, sales: 8 },
    { name: 'Week 4', leads: 65, sales: 12 },
];

// const AGENTS_LIST = ['All Agents', 'Ramesh', 'Suresh', 'Sundhar', 'Priya', 'John'];
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
const InsightCard = ({ title, value, trend, trendValue, icon: Icon, insight }) => {

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-400">{title}</p>
                        {/* <h3 className="text-xl font-bold text-white mt-2">{value}</h3> */}
                        <h3 className="text-xl font-bold text-white mt-2 ">{value}</h3>
                    </div>
                    <div className="p-2 bg-slate-800 rounded-lg text-fuchsia-500">
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                {/* <div className="mt-4 flex items-center gap-2">
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
      </div> */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex gap-2 items-start">
                        <Brain className="w-3 h-3 text-fuchsia-500 mt-1 shrink-0" />
                        <p className="text-xs text-slate-400 italic leading-relaxed">"{insight}"</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};

export default function Report() {
    const [loading, setLoading] = useState(true);

    // --- STATE FOR AGENT PERFORMANCE ---
    // const [selectedAgent, setSelectedAgent] = useState(decode(localStorage.getItem("EmployeeId")));
    const [selectedAgent, setSelectedAgent] = useState("");
    const [selectedAgentName, setSelectedAgentName] = useState('')
    // const [selectedMonth, setSelectedMonth] = useState('Nov 2025');
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [chartData, setChartData] = useState([]);
    // const [selectedSite, setSelectedSite] = useState(decode(localStorage.getItem("SiteId")));
    const [selectedSite, setSelectedSite] = useState("");
    const [FilteredData, setFilteredData] = useState({
        totalLeads: '',
        followUpCount: '',
        siteVisitCount: '',
        newCount:'',
        conversionRate: '',
        topSources: '',
        topSites: '',
        agentPerformance: '',
        weeklyVelocity: ''

    })

    console.log(FilteredData, "FilteredData")
    const [leads, setLeads] = useState([])
    const [agents, setAgents] = useState([]);
    const [leadSources, setLeadSources] = useState([])
    // console.log(leadSources,"leadSources")
    const [sourceLoading, setSourceLoading] = useState(false);
    const [siteData, setSiteData] = useState([]);
    const [sites, setSites] = useState([]);
    console.log(sites, "sites")
    const [siteLoading, setSiteLoading] = useState(false);
    const [weeklyTrend, setWeeklyTrend] = useState([]);
    const [weeklyLoading, setWeeklyLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [availablePlots, setAvailablePlots] = useState([]);
    const [plotLoading, setPlotLoading] = useState(false);
    const [callSummary, setCallSummary] = useState({
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        avgAnsweredDuration: 0,
        avgMissedWaitTime: 0
    });

    const [Visitor, setVisitor] = useState({
        totalVisitors: 0,
        visitCompletedCount: 0,
        visitPendingCount: 0,
        completionRate: "0%"
    })
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState("");

    // const [chartData, setChartData] = useState([]);
    const [fromDate, setFromDate] = useState(
        dayjs().startOf("month").toDate()
    );
    const [toDate, setToDate] = useState(
        dayjs().endOf("month").toDate()
    );



    // Simulate API loading
    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    // Update chart data when filters change
    // useEffect(() => {
    //   if (selectedAgent === 'All Agents') {
    //     setChartData(allAgentsPerformance);
    //   } else {
    //     // Logic to fetch specific agent data for specific month
    //     // Here we use mock data generator
    //     setChartData(getIndividualProgress(selectedAgent));
    //   }
    // }, [selectedAgent, selectedMonth]);

    // useEffect(() => {
    //   const init = async () => {
    //     setLoading(true);
    //     await Promise.all([
    //       getAllReport(),
    //       getAllEmployee(),
    //       getLeadSources(),
    //       getSiteDistribution(),
    //       getWeeklyLeadVelocity()
    //     ]);
    //     setLoading(false);
    //   };
    //   init();
    // }, []);

    useEffect(() => {
        applyMonthFilter();
    }, [selectedSite, selectedAgent, selectedUnit]);

    // useEffect(() => {
    //     getWeeklyLeadVelocity();
    // }, [selectedMonth]);


    useEffect(() => {
        setSelectedUnit("");
    }, [selectedSite]);



    const buildPayload = (fromDate, toDate) => {
        const payload = { fromDate, toDate };

        if (selectedSite) {
            payload.siteId = selectedSite;
        }

        if (selectedAgent) {
            payload.EmployeeId = selectedAgent;
        }
        if (selectedUnit) {
            payload.unitId = selectedUnit;
        }

        return payload;
    };



    const getCallSummary = async (fromDate, toDate) => {

        const payload = buildPayload(fromDate, toDate);
        try {

            const res = await fetch(
                config.Api + "Report/getCallSummary",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const result = await res.json();
            setCallSummary(result.data || {
                totalCalls: 0,
                answeredCalls: 0,
                missedCalls: 0,
                avgAnsweredDuration: 0,
                avgMissedWaitTime: 0
            });

        } catch (err) {
            console.error("TeleCMI call summary error", err);
        }
    };



    // const getWeeklyLeadVelocity = async (fromDate, toDate) => {
    //     const payload = buildPayload(fromDate, toDate);
    //     try {
    //         setWeeklyLoading(true);

    //         const res = await fetch(
    //             config.Api + "Report/WeeklyLeadVelocity",
    //             {
    //                 method: "POST",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify(payload)
    //             }
    //         );

    //         const result = await res.json();
    //         setWeeklyTrend(result.data || []);

    //     } catch (err) {
    //         console.error("Weekly trend error", err);
    //     } finally {
    //         setWeeklyLoading(false);
    //     }
    // };


    const getLeadReports = async (fromDate, toDate) => {
        const payload = buildPayload(fromDate, toDate);

        const res = await fetch(config.Api + "Report/getLeadReports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        // console.log(result,"result")
        const normalized = {
            totalLeads: result.summary?.totalLeads || 0,
            followUpCount: result.summary?.followUpCount || 0,
            siteVisitCount: result.summary?.siteVisitCount || 0,
            newCount: result.summary?.newCount || 0,
            conversionRate: result.summary?.conversionRate || "0%",
            topSources: result.topSources || [],
            topSites: result.topSites || [],
            agentPerformance: result.agentPerformance?.map(a => ({
                name: a.agentName,
                leads: a.totalAssigned,
                converted: a.agentSiteVisits
            })) || [],
            weeklyVelocity: result.weeklyVelocity?.map(w => ({
                name: `Week ${w._id}`,
                leads: w.count,
                sales: Math.round(w.count * 0.2) // optional
            })) || []
        };

        setFilteredData(normalized);
    };

    const getVisitorReports = async (fromDate, toDate) => {
        const payload = buildPayload(fromDate, toDate);

        const res = await fetch(config.Api + "Report/getVisitorReports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        // console.log(result,"result")
        const normalized = {
            visitCompletedCount: result.summary?.visitCompletedCount || 0,
            totalVisitors: result.summary?.totalVisitors || 0,
            visitPendingCount: result.summary?.visitPendingCount || 0,
            completionRate: result.summary?.completionRate || "0%"

        };

        setVisitor(normalized);
    };



    const getAvailablePlots = async () => {
        const payload = buildPayload(fromDate, toDate);
        try {
            setPlotLoading(true);

            const res = await fetch(
                config.Api + "Report/getAllAvailablePlots",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const result = await res.json();
            setAvailablePlots(result.data || []);

        } catch (err) {
            console.error("Available plot error", err);
        } finally {
            setPlotLoading(false);
        }
    };

    const plotStatusSummary = availablePlots.reduce((acc, plot) => {
        const status = plot.statusId?.statusName || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});


    const getAllSite = async () => {
        try {

            let url = config.Api + "Site/getAllSites";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const result = await res.json();
            const data = result.data || result;

            setSites(data);

        } catch (err) {
            toast({
                title: "Error",
                description: "Could not fetch Report total lead",
                variant: "destructive",
            });
        }
    };


    const getAllUnits = async () => {
        try {
            const res = await fetch(config.Api + "Unit/getAllUnits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const result = await res.json();
            const data = result.data || result;
            setUnits(data);
        } catch (err) {
            console.error("Unit fetch error", err);
        }
    };


    const getAllEmployee = async () => {
        try {

            let url = config.Api + "Employee/getAllEmployees";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const result = await res.json();
            const data = result.data || result;

            const filteredEmployees = data.filter(
                (emp) => emp.EmployeeName !== "Eethal"
            );

            setAgents(filteredEmployees);
        } catch (err) {
            toast({
                title: "Error",
                description: "Could not fetch Employee",
                variant: "destructive",
            });
        }
    };

    // useEffect(() => {
    //     fetchChartData(fromDate, toDate);
    //     getCallSummary(fromDate, toDate)
    // }, [selectedAgent]);

    // const fetchChartData = async (fromDate, toDate) => {
    //          const payload = buildPayload(fromDate, toDate);
    //     try {
    //         const url =
    //             selectedAgent === "All Agents"
    //                 ? "Report/AgentSummary"
    //                 : "Report/AgentProgress";

    //         const res = await fetch(config.Api + url, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(payload)
    //         });

    //         const result = await res.json();
    //         setChartData(result.data || []);
    //     } catch (err) {
    //         console.error("Chart fetch error", err);
    //     }
    // };

    const getLeadSources = async (fromDate, toDate) => {
        const payload = buildPayload(fromDate, toDate);
        try {
            setSourceLoading(true);

            const res = await fetch(
                config.Api + "Report/leadSourceSummary",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            const result = await res.json();
            setLeadSources(result.data || []);

        } catch (err) {
            console.error("Lead source error", err);
        } finally {
            setSourceLoading(false);
        }
    };


    const getSiteDistribution = async (fromDate, toDate) => {
        const payload = buildPayload(fromDate, toDate);
        try {
            setSiteLoading(true);

            const res = await fetch(
                config.Api + "Report/SiteDistribution",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            const result = await res.json();
            setSiteData(result.data || []);

        } catch (err) {
            console.error("Site distribution error", err);
        } finally {
            setSiteLoading(false);
        }
    };

    // const applyPreset = (type) => {
    //     let from, to;

    //     switch (type) {
    //         case "today":
    //             from = dayjs().startOf("day");
    //             to = dayjs().endOf("day");
    //             break;

    //         case "yesterday":
    //             from = dayjs().subtract(1, "day").startOf("day");
    //             to = dayjs().subtract(1, "day").endOf("day");
    //             break;

    //         case "last7":
    //             from = dayjs().subtract(6, "day").startOf("day");
    //             to = dayjs().endOf("day");
    //             break;

    //         case "last30":
    //             from = dayjs().subtract(29, "day").startOf("day");
    //             to = dayjs().endOf("day");
    //             break;

    //         default:
    //             return;
    //     }

    //     setDateRange([from, to]);
    //     applyFilters(from, to);
    //     setAnchorEl(null);
    // };

    const applyCustomRange = () => {
        applyFilters(dateRange[0], dateRange[1]);
        setAnchorEl(null);
    };

    // const applyMonthFilter = () => {
    //   const fromDate = selectedMonth.startOf("month").toDate();
    //   const toDate = selectedMonth.endOf("month").toDate();

    //   getAllReport(fromDate, toDate);
    //   getAllEmployee(fromDate, toDate);
    //   getLeadSources(fromDate, toDate);
    //   getSiteDistribution(fromDate, toDate);
    //   getWeeklyLeadVelocity(fromDate, toDate);
    //   fetchChartData(fromDate, toDate);
    // };


    const applyMonthFilter = () => {
        const start = selectedMonth.startOf("month").toDate();
        const end = selectedMonth.endOf("month").toDate();

        setFromDate(start);
        setToDate(end);

        getLeadReports(start, end);
        getAllEmployee(start, end);
        getLeadSources(start, end);
        getSiteDistribution(start, end);
        // getWeeklyLeadVelocity(start, end);
        // fetchChartData(start, end);
        getAllSite(start, end)
        getAvailablePlots(start, end)
        getCallSummary(start, end)
        getVisitorReports(start, end)
        getAllUnits(start, end)
    };

    const handleExport = () => {
        // -------- Sheet 1: Summary --------
        const summarySheet = [
            { Metric: "Total Leads", Value: FilteredData.totalLeads },
            { Metric: "Follow Ups", Value: FilteredData.followUpCount },
            { Metric: "Site Visits", Value: FilteredData.siteVisitCount },
            { Metric: "Conversion Rate", Value: FilteredData.conversionRate },
            { Metric: "Visit Completed", Value: Visitor.visitCompletedCount },
            { Metric: "Available Plots", Value: availablePlots.length },
            { Metric: "Total Calls", Value: callSummary.totalCalls },
            { Metric: "Answered Calls", Value: callSummary.answeredCalls },
            { Metric: "Missed Calls", Value: callSummary.missedCalls },
        ];

        // -------- Sheet 2: Agent Performance --------
        const agentSheet = FilteredData.agentPerformance.map(a => ({
            Agent: a.name,
            Leads_Assigned: a.leads,
            Converted: a.converted,
        }));

        // -------- Sheet 3: Lead Sources --------
        const sourceSheet = leadSources.map(s => ({
            Source: s.name,
            Leads: s.value,
        }));

        // -------- Sheet 4: Site Distribution --------
        const siteSheet = siteData.map(s => ({
            Site: s.name,
            Leads: s.value,
        }));

        // -------- Sheet 5: Available Plots --------
        const plotSheet = availablePlots.map(p => ({
            Plot_No: p.plotNumber,
            Site: p.siteId?.sitename || "",
            Unit: p.unitId?.UnitName || "",
            SqFt: p.areaInSqFt,
            Facing: p.facing,
            Status: p.statusId?.statusName,
        }));

        // Create workbook
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), "Summary");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agentSheet), "Agent Performance");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sourceSheet), "Lead Sources");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(siteSheet), "Site Distribution");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(plotSheet), "Available Plots");

        //  Direct browser download (NO file-saver)
        XLSX.writeFile(
            wb,
            `Report_${selectedMonth.format("MMMM_YYYY")}.xlsx`
        );
    };


    const funnelData = [
        { label: "New Lead", value: FilteredData.newCount, trend: "up" },
        { label: "Lead Followup", value: FilteredData.followUpCount, trend: "up" },
        { label: "Lead Site Visit", value: FilteredData.siteVisitCount, trend: "up" },
        { label: "Visit Completed", value: FilteredData.visitCompletedCount || 0, trend: "up" },
        // { label: "Plot Available", value: availablePlots.length, trend: "down" },

    ];




    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-fuchsia-500">
                <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Analytics...
            </div>
        );
    }





    return (
        <div className="space-y-6  min-h-screen p-4 text-slate-100  bg-gradient-to-br from-[#0b0f1a] via-[#0f172a] to-[#140b2d]">

            {/* HEADER */}
            <div className=" flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl p-5 bg-gradient-to-r from-slate-900/80 to-slate-800/60 border border-slate-700/40 backdrop-blur-md shadow-lg">
                <div>
                    <h1 className=" md:text-3xl text-xl font-bold  bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                        <TrendingUp className="text-fuchsia-600 w-8 h-8" />
                        Reports
                    </h1>
                    <p className="text-slate-400 text-xs mt-1 tracking-wide">AI-powered insights and performance metrics.</p>
                </div>

                <div className='flex gap-3 md:flex-row flex-col items-start md:ps-40'>

                    <div className="relative w-full sm:w-auto">
                        <select
                            className="w-full sm:w-auto h-9 rounded-md border bg-slate-900/80 border-slate-700/50 hover:border-fuchsia-500 pl-3 pr-8 text-xs text-slate-100 focus:border-fuchsia-500 focus:outline-none appearance-none cursor-pointer"
                            value={selectedSite}
                            onChange={(e) => setSelectedSite(e.target.value)}
                        >
                            <option value="">All Sites</option>
                            {sites.map((site) => (
                                <option key={site._id} value={site._id}>
                                    {site.sitename}
                                </option>
                            ))}
                        </select>

                        <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            className="w-full sm:w-auto h-9 rounded-md border bg-slate-900/80 border-slate-700/50 hover:border-fuchsia-500 pl-3 pr-8 text-xs text-slate-100 focus:border-fuchsia-500 focus:outline-none appearance-none cursor-pointer"
                            value={selectedAgent}
                            onChange={(e) => {
                                const agentId = e.target.value
                                const agentName = agents.find(e => e._id === agentId)
                                // console.log(agentName.EmployeeName,"agentName")
                                if (agentName) {
                                    setSelectedAgentName(agentName.EmployeeName)
                                } else {
                                    setSelectedAgentName('')
                                }
                                setSelectedAgent(agentId)
                            }}
                        >
                            <option value="">All Agents</option>
                            {agents.map((agent) => (
                                <option key={agent._id} value={agent._id}>
                                    {agent.EmployeeName}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>


                </div>

                <div className="flex gap-3 md:flex-row flex-col items-start">
                    <Button variant="outline" className="w-full sm:w-auto h-9 rounded-md border bg-slate-900/80 border-slate-700/50 hover:border-fuchsia-500 pl-3 pr-8 text-xs text-slate-100 focus:border-fuchsia-500 focus:outline-none appearance-none cursor-pointer">
                        <Calendar className="w-4 h-4 mr-2" />
                        {selectedMonth.format("MMMM YYYY")}
                        <IconButton
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{ color: "white" }}
                        >
                            <Filter />
                        </IconButton>
                    </Button>



                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    >
                        <Box sx={{ p: 2, width: 260 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    views={["year", "month"]}
                                    label="Select Month"
                                    value={selectedMonth}
                                    onChange={(newValue) => setSelectedMonth(newValue)}
                                />
                            </LocalizationProvider>

                            <Button
                                className="mt-3 w-full"
                                onClick={() => {
                                    applyMonthFilter();
                                    setAnchorEl(null);
                                }}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Popover>



                    <Button onClick={handleExport} className={`  className="
    bg-gradient-to-r from-fuchsia-600 to-purple-600
    text-white
    shadow-lg
    hover:opacity-90
  "`}>
                        <Upload className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>



            <div>
                <Card>
                    <CardContent className="p-6">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Call Health Overview
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Telephony performance during selected period
                                </p>
                            </div>
                            <Smartphone className="w-6 h-6 text-fuchsia-500" />
                        </div>

                        {/* TOP METRICS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* TOTAL CALLS */}
                            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-900/40 to-slate-900/70
                      border border-indigo-500/20">
                                <p className="text-xs text-slate-400">Total Calls</p>
                                <h3 className="text-3xl font-bold text-white mt-1">
                                    {callSummary.totalCalls}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2">
                                    Inbound + Outbound
                                </p>
                            </div>

                            {/* ANSWERED */}
                            <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/30 to-slate-900/70
                      border border-green-500/20">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-400">Answered</p>
                                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                                </div>

                                <h3 className="text-3xl font-bold text-green-400 mt-1">
                                    {callSummary.answeredCalls}
                                </h3>

                                <p className="text-xs text-slate-500 mt-2">
                                    {callSummary.totalCalls
                                        ? Math.round(
                                            (callSummary.answeredCalls / callSummary.totalCalls) * 100
                                        )
                                        : 0}% success rate
                                </p>
                            </div>

                            {/* MISSED */}
                            <div className="p-5 rounded-xl bg-gradient-to-br from-red-900/30 to-slate-900/70
                      border border-red-500/20">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-400">Missed</p>
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>

                                <h3 className="text-3xl font-bold text-red-400 mt-1">
                                    {callSummary.missedCalls}
                                </h3>

                                <p className="text-xs text-slate-500 mt-2">
                                    {callSummary.totalCalls
                                        ? Math.round(
                                            (callSummary.missedCalls / callSummary.totalCalls) * 100
                                        )
                                        : 0}% drop rate
                                </p>
                            </div>

                        </div>

                        {/* SECONDARY METRICS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                            {/* AVG ANSWER DURATION */}
                            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                                <p className="text-xs text-slate-400">Avg Answer Duration</p>
                                <h3 className="text-xl font-bold text-white mt-1">
                                    {Math.floor(callSummary.avgAnsweredDuration / 60)}m{" "}
                                    {callSummary.avgAnsweredDuration % 60}s
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Talk time per answered call
                                </p>
                            </div>

                            {/* AVG MISSED WAIT */}
                            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                                <p className="text-xs text-slate-400">Avg Missed Wait Time</p>
                                <h3 className="text-xl font-bold text-yellow-400 mt-1">
                                    {callSummary.avgMissedWaitTime}s
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Caller wait before drop
                                </p>
                            </div>

                        </div>

                        {/* AI INSIGHT */}
                        <div className="mt-6 p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex gap-2">
                            <Brain className="w-4 h-4 text-fuchsia-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-300 leading-relaxed">
                                <span className="font-semibold text-fuchsia-400">AI Insight:</span>{" "}
                                {callSummary.missedCalls > callSummary.answeredCalls * 0.3
                                    ? "Missed calls are high. Consider adding callback automation or increasing agent coverage during peak hours."
                                    : "Call handling efficiency is healthy. Current staffing levels appear sufficient."}
                            </p>
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* KPI & AI INSIGHTS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InsightCard
                    title="Total Leads"
                    value={FilteredData.totalLeads}
                    trend="up"
                    // trendValue="+12.5%"
                    icon={Users}
                    insight="Total number of leads received from all sources during the selected period.."
                />
                <InsightCard
                    title="Conversion Rate"
                    value={FilteredData.conversionRate}
                    trend="down"
                    // trendValue="-1.4%"
                    icon={TrendingUp}
                    insight="Shows how many leads were converted compared to the total leads received."
                />
                <InsightCard
                    title="Top Source"
                    value={FilteredData.topSources.length > 0 ? FilteredData.topSources[0]._id : ''}
                    trend="up"
                    // trendValue="+5.2%"
                    icon={Smartphone}
                    insight="Shows which marketing source contributed the most leads.."
                />
                <InsightCard
                    title="Top Site"
                    value={FilteredData.topSites.length > 0 ? FilteredData.topSites[0]._id : ''}
                    trend="up"
                    // trendValue="+8.0%"
                    icon={MapPin}
                    insight="Shows which site received the most leads."
                />
            </div>




            <div className="bg-slate-900 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Funnel */}
                <div className="flex flex-col gap-3">
                    {funnelData.map((item, index) => (
                        <div
                            key={index}
                            className="relative bg-gradient-to-r from-indigo-600 to-indigo-500 
                       text-white py-3 px-4 rounded-md 
                       flex items-center justify-between"
                            style={{
                                width: `${100 - index * 10}%`
                            }}
                        >
                            <span className="text-sm font-medium">{item.label}</span>

                            {item.trend === "up" ? (
                                <ArrowUpRight className="text-green-300" size={18} />
                            ) : (
                                <ArrowDownRight className="text-yellow-300" size={18} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Counts */}
                <div className="bg-slate-800 rounded-lg p-4">
                    <div className="grid grid-cols-3 text-xs text-slate-400 pb-2 border-b border-slate-700">
                        <span>Stage</span>
                        <span className="text-center">Count</span>
                        <span className="text-right">Trend</span>
                    </div>

                    {funnelData.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-3 items-center py-3 text-sm border-b border-slate-700 last:border-none"
                        >
                            <span className="text-slate-200">{item.label}</span>
                            <span className="text-center font-semibold text-white">
                                {item.value}
                            </span>
                            <span className="flex justify-end">
                                {item.trend === "up" ? (
                                    <ArrowUpRight className="text-green-400" size={16} />
                                ) : (
                                    <ArrowDownRight className="text-yellow-400" size={16} />
                                )}
                            </span>
                        </div>
                    ))}
                </div>

            </div>


            <Card>
                <CardContent className="p-6">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Visitor Engagement Details
                            </h3>
                            <p className="text-xs text-slate-400">
                                Breakdown of scheduled vs completed site visits
                            </p>
                        </div>
                        <Users className="w-6 h-6 text-fuchsia-500" />
                    </div>

                    {/* STAT GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400">Total Visits</p>
                            <h4 className="text-xl font-bold text-white mt-1">
                                {Visitor.totalVisitors}
                            </h4>
                        </div>

                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400">Completed</p>
                            <h4 className="text-xl font-bold text-green-400 mt-1">
                                {Visitor.visitCompletedCount}
                            </h4>
                        </div>

                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400">Pending</p>
                            <h4 className="text-xl font-bold text-yellow-400 mt-1">
                                {Visitor.visitPendingCount}
                            </h4>
                        </div>

                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400">Completion Rate</p>
                            <h4 className="text-xl font-bold text-fuchsia-400 mt-1">
                                {Visitor.completionRate}
                            </h4>
                        </div>

                    </div>

                    {/* PROGRESS + CONTEXT */}
                    <div className="mt-6 grid md:grid-cols-3 gap-6">

                        {/* Progress */}
                        <div className="md:col-span-2">
                            <p className="text-xs text-slate-400 mb-2">
                                Visit Conversion Progress
                            </p>

                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-fuchsia-500"
                                    style={{ width: Visitor.completionRate }}
                                />
                            </div>

                            <p className="text-xs text-slate-500 mt-2">
                                Higher completion rates indicate better agent follow-up discipline.
                            </p>
                        </div>

                        {/* AI Insight */}
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">AI Insight</p>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {parseFloat(Visitor.completionRate) < 50
                                    ? "Pending visits are high. Introduce reminder automation or tighter scheduling windows."
                                    : "Visit follow-up flow is optimized. Maintain current engagement strategy."}
                            </p>
                        </div>

                    </div>

                </CardContent>
            </Card>

            <Card className="lg:col-span-4">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

                        {/* Title */}
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Site-wise Plot Availability
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Inventory distribution across sites & units
                            </p>
                        </div>

                        {/* Unit Filter */}
                        {/* <div className="relative">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full
                    bg-slate-900/70 border border-slate-700/5
                    hover:border-fuchsia-500 transition cursor-pointer">
                                <MapPin className="w-4 h-4 text-fuchsia-400" />
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
                                >
                                    <option value="" className="bg-slate-900 text-slate-100">All Units</option>
                                    {units.map((unit) => (
                                        <option key={unit._id} value={unit._id} className="bg-slate-900 text-slate-100"
                                        >
                                            {unit.UnitName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                        </div> */}

                    </div>




                    <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(
                            availablePlots.reduce((acc, plot) => {
                                const site = plot.siteId?.sitename || "Unknown Site";
                                const status = plot.statusId?.statusName;

                                if (!acc[site]) {
                                    acc[site] = { Available: 0, Interested: 0, Booked: 0, Sold: 0 };
                                }
                                if (status) acc[site][status]++;
                                return acc;
                            }, {})
                        ).map(([site, stats]) => (
                            <div
                                key={site}
                                className="rounded-lg border border-slate-800 p-4 bg-slate-900/60 hover:border-fuchsia-500 transition"
                            >
                                <h4 className="font-semibold text-white mb-3">{site}</h4>

                                <div className="grid grid-cols-4 gap-2 text-xs text-center">
                                    <div className="bg-green-500/10 text-green-400 rounded p-2">
                                        Avl<br /><b>{stats.Available}</b>
                                    </div>
                                    <div className="bg-blue-500/10 text-blue-400 rounded p-2">
                                        Interested<br /><b>{stats.Interested}</b>
                                    </div>
                                    <div className="bg-yellow-500/10 text-yellow-400 rounded p-2">
                                        Book<br /><b>{stats.Booked}</b>
                                    </div>
                                    <div className="bg-red-500/10 text-red-400 rounded p-2">
                                        Sold<br /><b>{stats.Sold}</b>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="grid grid-cols-2 gap-4 h-full">

                            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                                <p className="text-xs text-slate-400">Total Inventory</p>
                                <h3 className="text-2xl font-bold text-white">
                                    {Object.values(plotStatusSummary).reduce((a, b) => a + b, 0)}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">All plots combined</p>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                                <p className="text-xs text-slate-400">Sell Through</p>
                                <h3 className="text-2xl font-bold text-green-400">
                                    {plotStatusSummary.Sold
                                        ? Math.round(
                                            (plotStatusSummary.Sold /
                                                Object.values(plotStatusSummary).reduce((a, b) => a + b, 0)) * 100
                                        )
                                        : 0}%
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Sold vs inventory</p>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 col-span-2">
                                <p className="text-xs text-slate-400 mb-2">AI Insight</p>
                                <p className="text-sm text-slate-200">
                                    📊 Inventory is heavily skewed towards
                                    <span className="text-fuchsia-400 font-semibold"> Available plots</span>.
                                    Recommend sales push or price incentives.
                                </p>
                            </div>

                        </div>

                    </div>
                </CardContent>
            </Card>


            {/* MAIN CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. AGENT PERFORMANCE (Dynamic Chart) */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">

                        <h3 className="text-lg font-bold text-white mb-1">
                            Agent Effectiveness Scorecard
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                            Performance quality & conversion strength
                        </p>

                        {/* SCORECARDS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                                <p className="text-xs text-slate-400">Agents</p>
                                <h3 className="text-xl font-bold text-white">
                                    {FilteredData.agentPerformance.length}
                                </h3>
                            </div>

                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                                <p className="text-xs text-slate-400">Total Leads</p>
                                <h3 className="text-xl font-bold text-white">
                                    {FilteredData.agentPerformance.reduce((a, b) => a + b.leads, 0)}
                                </h3>
                            </div>

                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                                <p className="text-xs text-slate-400">Conversions</p>
                                <h3 className="text-xl font-bold text-green-400">
                                    {FilteredData.agentPerformance.reduce((a, b) => a + b.converted, 0)}
                                </h3>
                            </div>

                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                                <p className="text-xs text-slate-400">Avg Conversion</p>
                                <h3 className="text-xl font-bold text-fuchsia-400">
                                    {FilteredData.agentPerformance.length
                                        ? Math.round(
                                            (FilteredData.agentPerformance.reduce(
                                                (a, b) => a + b.converted,
                                                0
                                            ) /
                                                FilteredData.agentPerformance.reduce(
                                                    (a, b) => a + b.leads,
                                                    0
                                                )) *
                                            100
                                        )
                                        : 0}%
                                </h3>
                            </div>

                        </div>

                        {/* CHART */}
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={FilteredData.agentPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="leads" fill="#334155" name="Assigned" />
                                    <Bar dataKey="converted" fill="#10b981" name="Converted" />
                                </BarChart>
                            </ResponsiveContainer>
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
                                        data={siteData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {siteData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="block text-2xl font-bold text-white">{siteData.length}</span>
                                    {/* <span className="text-xs text-slate-400">Active Sites</span> */}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {siteData.map((entry, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                        <span className="text-slate-300">{entry.name}</span>
                                    </div>
                                    <span className="font-medium text-white">{(siteData.length / sites.length) * 100}%</span>
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
                        <h3 className="text-lg font-bold text-white mb-6">
                            Lead Source Funnel Impact
                        </h3>

                        <div className="space-y-3">
                            {leadSources.map((src, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-lg
                     bg-slate-900/70 border border-slate-800"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {src.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Source contribution
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-bold text-fuchsia-400">
                                            {src.value}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            leads
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                            <p className="text-xs text-slate-300">
                                💡 <span className="text-fuchsia-400 font-semibold">Recommendation:</span>{" "}
                                Invest more in top 2 sources and de-prioritize low-yield channels.
                            </p>
                        </div>
                    </CardContent>
                </Card>




                {/* 4. WEEKLY TREND (Line Chart) */}
                <Card>
                    <CardContent className="p-6">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Weekly Lead Velocity
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Lead inflow trend & source contribution
                                </p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-fuchsia-500" />
                        </div>

                        {/* CHART */}
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FilteredData.weeklyVelocity}>
                                    <defs>
                                        <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.7} />
                                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} />

                                    <Area
                                        type="monotone"
                                        dataKey="leads"
                                        name="Leads"
                                        stroke="#d946ef"
                                        fill="url(#leadsGradient)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        name="Conversions"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* SOURCE CONTRIBUTION */}
                        <div className="mt-5">
                            <p className="text-xs text-slate-400 mb-2">
                                Lead Source Contribution
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {leadSources.slice(0, 4).map((src, i) => (
                                    <div
                                        key={i}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium
                       bg-slate-900/70 border border-slate-800
                       text-slate-200"
                                    >
                                        {src.name} ·{" "}
                                        <span className="text-fuchsia-400 font-semibold">
                                            {src.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* LEGEND */}
                        {/* <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-fuchsia-500 rounded-sm"></span>
                                Leads Received
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                                Conversions
                            </div>
                        </div> */}

                        {/* INSIGHT */}
                        <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                            <p className="text-xs text-slate-300">
                                💡 <span className="text-fuchsia-400 font-semibold">Insight:</span>{" "}
                                Lead momentum is strongest in recent weeks. WhatsApp and Facebook
                                continue to dominate acquisition — consider reallocating budget
                                towards the top 2 sources.
                            </p>
                        </div>

                    </CardContent>
                </Card>


            </div>
        </div>
    );
}