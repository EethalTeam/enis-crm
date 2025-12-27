import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Loader2, Pause, X, UserPlus, Filter, User, Phone, Clock, Hourglass, Download, PhoneCall } from 'lucide-react';
import { config } from '@/components/CustomComponents/config.js';
import { LeadDialog } from "@/pages/Leads";
import PIOPIY from 'piopiyjs';
import * as XLSX from "xlsx";

// --- Utility for Credentials ---
const decode = (value) => {
  if (!value) return "";
  try {
    return atob(value);
  } catch (err) {
    console.error("Decode failed:", err);
    return "";
  }
};

// --- Inline UI Components (Unchanged) ---
const Card = ({ className, children }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ className, children }) => (
  <div className={className}>{children}</div>
);
const Badge = ({ className, children }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</div>
);
const Button = ({ className, variant = "default", size = "default", onClick, disabled, children }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-slate-800 hover:text-slate-100",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700"
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-8 rounded-md px-3 text-xs" };
  return (
    <button className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`} onClick={onClick} disabled={disabled}>{children}</button>
  );
};

// --- Toast Implementation (Unchanged) ---
const ToastContext = createContext({});
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 3000);
  };
  const dismiss = (id) => { setToasts((prev) => prev.filter((t) => t.id !== id)); };
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${t.variant === 'destructive' ? 'bg-red-900/90 border-red-800 text-white' : t.variant === 'success' ? 'bg-green-900/90 border-green-800 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-sm'}`}>
              <div>
                {t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}
                {t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => useContext(ToastContext);

// --- Component Logic ---
const statusColors = {
  'answered': 'bg-green-600 text-white hover:bg-green-700 border-transparent',
  'missed': 'bg-red-600 text-white hover:bg-red-700 border-transparent',
  'failed': 'bg-slate-600 text-white hover:bg-slate-700 border-transparent',
  'busy': 'bg-orange-500 text-white hover:bg-orange-600 border-transparent',
};

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatTime = (isoString) => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function CallLogsContent() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qualifyingId, setQualifyingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // --- TeleCMI Dialer Integration ---
  const piopiyRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const TelecmiID = decode(localStorage.getItem("TelecmiID"));
  const TelecmiPassword = decode(localStorage.getItem("TelecmiPassword"));

  const audioRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadInitialData, setLeadInitialData] = useState(null);

  // Initialize TeleCMI SDK (Same logic as your Dialer)
  useEffect(() => {
    isMountedRef.current = true;
    if (!piopiyRef.current && TelecmiID && TelecmiPassword) {
      piopiyRef.current = new PIOPIY({
        name: 'Eethal CRM Agent',
        debug: false,
        autoplay: true,
        ringTime: 60
      });

      const sdk = piopiyRef.current;
      sdk.on('login', () => setIsLoggedIn(true));
      sdk.on('loginFailed', (res) => {
        if (res && (res.code == 200 || res.msg === "User loged in successfully")) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      });

      setTimeout(() => {
        if (isMountedRef.current && piopiyRef.current && !isLoggedIn) {
          sdk.login(TelecmiID, TelecmiPassword, '@sbcind.telecmi.com');
        }
      }, 800);
    }

    return () => {
      isMountedRef.current = false;
      if (piopiyRef.current) {
        piopiyRef.current.logout();
        piopiyRef.current = null;
      }
    };
  }, []);

  const handleInitiateCall = (rawNumber) => {
    if (!isLoggedIn) return toast({ title: "Connecting", description: "Dialer is not ready. Please wait.", variant: "destructive" });
    if (!rawNumber) return toast({ title: "Error", description: "No phone number found", variant: "destructive" });

    let cleanNumber = rawNumber.replace(/\D/g, '');
    if (!cleanNumber.startsWith('91')) cleanNumber = '91' + cleanNumber;

    toast({ title: "Calling...", description: `Initiating call to ${cleanNumber}`, variant: "success" });
    if (piopiyRef.current) {
      piopiyRef.current.call(cleanNumber);
    }
  };

  // Fetch Logs (Unchanged)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        let url = config.Api + "CallLogs/getAllCallLogs";
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 1, limit: 50 }),
        });
        if (!response.ok) throw new Error('Failed to fetch logs');
        const data = await response.json();
        setLogs(data.data || data.calls || []);
      } catch (err) {
        console.error(err);
        setLogs([
          { _id: 'mock1', cmiuuid: '1', from: '919876543210', to: '918888888888', status: 'answered', direction: 'inbound', answeredsec: 323, callDate: new Date().toISOString(), recordingUrl: 'https://www.soundhelix.com/examples/mp3/Soundhelix-Song-1.mp3' },
          { _id: 'mock2', cmiuuid: '2', from: '917777777777', to: '919999999999', status: 'missed', direction: 'inbound', answeredsec: 0, callDate: new Date().toISOString() },
        ]);
        toast({ title: "Demo Mode", description: "API unavailable. Showing mock data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getFilteredLogs = () => {
    switch (activeTab) {
      case 'incoming': return logs.filter(log => log.direction === 'inbound' || log.direction === 'incoming');
      case 'outgoing': return logs.filter(log => log.direction === 'outbound' || log.direction === 'outgoing');
      case 'rnr': return logs.filter(log => log.status === 'missed' || log.status === 'busy');
      default: return logs;
    }
  };
  const filteredLogs = getFilteredLogs();

  const handlePlayRecording = (recordingUrl, id) => {
    if (!recordingUrl) return toast({ title: "No Recording", variant: "destructive" });
    if (playingId === id) { audioRef.current?.pause(); setPlayingId(null); return; }
    audioRef.current?.pause();
    const audio = new Audio(recordingUrl);
    audioRef.current = audio;
    audio.play().then(() => { setPlayingId(id); }).catch(() => { setPlayingId(null); });
    audio.onended = () => { setPlayingId(null); };
  };

  const exportCallLogsToExcel = () => {
    if (!filteredLogs.length) return;
    const excelData = filteredLogs.map((call, index) => ({
      "S.No": index + 1,
      "Call Type": call.direction === "inbound" ? "Incoming" : "Outgoing",
      "Caller": call.direction === "inbound" ? call.from : (call.user || "Agent"),
      "Phone Number": call.to || "",
      "Status": call.status || "",
      "Call Time": new Date(call.callDate).toLocaleString("en-IN"),
      "Duration": formatDuration(call.answeredsec || call.duration)
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Call Logs");
    XLSX.writeFile(workbook, `CallLogs_${activeTab}.xlsx`);
  };

  const TabButton = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} className={`relative px-4 py-2 text-sm font-medium transition-all rounded-md ${activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
      {label}
      {activeTab === id && <motion.div layoutId="activeTab" className="absolute inset-0 rounded-md bg-blue-600 -z-10" />}
    </button>
  );

  return (

    <div className="space-y-6 mt-3 p-4 bg-slate-950  min-h-screen text-slate-100">
      <div  className="sticky top-0 z-30 bg-slate-950 px-2 pt-2 pb-2 ">
        <div className="flex md:flex-row flex-col items-start md:items-center space-y-4  justify-between">
          <h1 className="md:text-3xl text-2xl font-bold text-white">Call Logs</h1>
        
          {loading && <Loader2 className="animate-spin text-white" />}

          {/* MOBILE SELECT */}
          <div className="md:hidden w-full ">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className=" w-full h-11 rounded-md bg-slate-900 border border-slate-700 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 " >
              <option value="all">All Calls</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="rnr">RNR</option>
            </select>
            </div>
            

    {/* <div className="space-y-6 p-4 bg-slate-950 min-h-screen text-slate-100">
      <div className="sticky top-0 z-30 bg-slate-950 p-4 space-y-10">
        <div className="flex md:flex-row flex-col items-start md:items-center space-y-4 justify-between">
          <h1 className="md:text-3xl text-2xl font-bold text-white">Call Logs</h1>
          <div className="flex gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isLoggedIn ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
               <div className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
               {isLoggedIn ? 'Dialer Ready' : 'Dialer Offline'}
            </div>
            <Button variant="outline" onClick={exportCallLogsToExcel} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            

          </div>
        </div>
        </div> */}

           {["Admin", "superadmin"].includes(localStorage.getItem("role")) && (
          <Button
            variant="outline"
            onClick={exportCallLogsToExcel}
            className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
         )}
      </div>

      
        <div className="hidden  md:flex items-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800 mt-3">
          <TabButton id="all" label="All Calls" />
          <TabButton id="incoming" label="Incoming" />
          <TabButton id="outgoing" label="Outgoing" />
          <TabButton id="rnr" label="RNR" />
        </div>
    
      </div>
      

      {/* Desktop Table */}
      <Card className="bg-slate-900 border-slate-800 hidden md:block">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Caller</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Number</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Recording</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((call, index) => (
                  <motion.tr key={call._id || index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      {call.status === 'missed' ? <PhoneMissed className="w-5 h-5 text-red-400" /> : call.direction === 'inbound' ? <PhoneIncoming className="w-5 h-5 text-green-400" /> : <PhoneOutgoing className="w-5 h-5 text-blue-400" />}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-white">{call.direction === 'inbound' ? call.from : (call.user || "Agent")}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2 group">
                        <span>{call.to || call.from}</span>
                        <button 
                          onClick={() => handleInitiateCall(call.to || call.from)}
                          className="p-1.5 rounded-full bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          title="Call Now"
                        >
                          <PhoneCall size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">{formatTime(call.callDate)}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{formatDuration(call.answeredsec)}</td>
                    <td className="py-3 px-4"><Badge className={statusColors[call.status]}>{call.status}</Badge></td>
                    <td className="py-3 px-4">
                      {call.recordingUrl && (
                        <Button variant="ghost" size="sm" onClick={() => handlePlayRecording(call.recordingUrl, call._id)} className={playingId === call._id ? 'text-green-400' : 'text-fuchsia-300'}>
                          {playingId === call._id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline" onClick={() => { setLeadInitialData({ leadPhone: call.from || "" }); setLeadDialogOpen(true); }}>
                        <UserPlus className="w-3.5 h-3.5 mr-2" /> Qualify
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredLogs.map((call, index) => (
          <motion.div key={call._id || index} className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
               {call.direction === 'inbound' ? <PhoneIncoming className="w-6 h-6 text-green-400" /> : <PhoneOutgoing className="w-6 h-6 text-blue-400" />}
               <Badge className={statusColors[call.status]}>{call.status}</Badge>
            </div>
            <div className="flex items-center gap-2 mb-2 text-white"><User className="w-4 h-4 text-purple-300" /> {call.from}</div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-fuchsia-300 text-sm"><Phone className="w-4 h-4" /> {call.to}</div>
              <button onClick={() => handleInitiateCall(call.to || call.from)} className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                <PhoneCall size={12} /> Call
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs mb-3"><Clock className="w-4 h-4" /> {formatTime(call.callDate)} | <Hourglass className="w-4 h-4" /> {formatDuration(call.answeredsec)}</div>
            <div className="flex gap-2 border-t border-slate-700 pt-3">
              {call.recordingUrl && <Button className="flex-1" variant="outline" size="sm" onClick={() => handlePlayRecording(call.recordingUrl, call._id)}>{playingId === call._id ? 'Pause' : 'Play'}</Button>}
              <Button className="flex-1" size="sm" onClick={() => { setLeadInitialData({ leadPhone: call.from || "" }); setLeadDialogOpen(true); }}>Qualify</Button>
            </div>
          </motion.div>
        ))}
      </div>

      <LeadDialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen} mode="create" initialData={leadInitialData} onSuccess={() => { toast({ title: "Lead Created", variant: "success" }); setLeadDialogOpen(false); }} />
    </div>
    
  );
}

export default function CallLogs() {
  return (
    <ToastProvider>
      <CallLogsContent />
    </ToastProvider>
  );
}