import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Loader2, Pause, X, UserPlus, CheckCircle, Filter, User, Phone, Clock, Hourglass } from 'lucide-react';
import { config } from '@/components/CustomComponents/config.js';
import { LeadDialog } from "@/pages/Leads";

// --- Inline UI Components for Portability ---

const Card = ({ className, children }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={className}>
    {children}
  </div>
);

const Badge = ({ className, children }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </div>
);

const Button = ({ className, variant = "default", size = "default", onClick, disabled, children }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-slate-800 hover:text-slate-100",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// --- REAL TOAST IMPLEMENTATION ---

const ToastContext = createContext({});

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${t.variant === 'destructive'
                ? 'bg-red-900/90 border-red-800 text-white'
                : t.variant === 'success'
                  ? 'bg-green-900/90 border-green-800 text-white'
                  : 'bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-sm'
                }`}
            >
              <div>
                {t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}
                {t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

// --- Main Component Logic ---

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

  // --- NEW: Tab State ---
  const [activeTab, setActiveTab] = useState('all');

  const audioRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  // const [popupOpen, setPopupOpen] = useState(false);
  // const [formData, setFormData] = useState({
  //   name: '',
  //   phone: '',
  //   email: '',
  //   notes: '',
  // });
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadInitialData, setLeadInitialData] = useState(null);



  // Fetch Logs
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
        const logData = data.data || data.calls || [];
        setLogs(logData);
      } catch (err) {
        console.error(err);
        // Mock data
        setLogs([
          { _id: 'mock1', cmiuuid: '1', from: 'John Doe', to: '+1234567890', status: 'answered', direction: 'inbound', answeredsec: 323, callDate: new Date().toISOString(), custom: 'Interested', recordingUrl: 'https://www.soundhelix.com/examples/mp3/Soundhelix-Song-1.mp3' },
          { _id: 'mock2', cmiuuid: '2', from: 'Jane Smith', to: '+1987654321', status: 'missed', direction: 'inbound', answeredsec: 0, callDate: new Date().toISOString(), custom: '', recordingUrl: null },
          { _id: 'mock3', cmiuuid: '3', from: 'Sales Team', to: '+1555555555', status: 'answered', direction: 'outbound', answeredsec: 120, callDate: new Date().toISOString(), custom: '', recordingUrl: null },
          { _id: 'mock4', cmiuuid: '4', from: 'Unknown', to: '+1999999999', status: 'missed', direction: 'inbound', answeredsec: 0, callDate: new Date().toISOString(), custom: '', recordingUrl: null },
        ]);
        setTimeout(() => {
          toast({
            title: "Demo Mode",
            description: "Could not connect to API. Showing mock data.",
            variant: "destructive"
          });
        }, 500);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FILTER LOGIC BASED ON TABS ---
  const getFilteredLogs = () => {
    switch (activeTab) {
      case 'incoming':
        return logs.filter(log => log.direction === 'inbound' || log.direction === 'incoming');
      case 'outgoing':
        return logs.filter(log => log.direction === 'outbound' || log.direction === 'outgoing');
      case 'rnr':
        // RNR typically means missed calls or ring-no-answer
        return logs.filter(log => log.status === 'missed' || log.status === 'busy');
      default:
        return logs;
    }
  };

  const filteredLogs = getFilteredLogs();

  // --- QUALIFY HANDLER ---
  const handleQualify = async (callId) => {
    if (!callId) return;
    setQualifyingId(callId);

    try {
      const url = `${config.Api}CallLogs/Qualify`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: callId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Lead Qualified",
          description: "Call log successfully converted to a lead.",
          variant: "success"
        });
      } else {
        throw new Error(result.message || "Failed to qualify lead");
      }
    } catch (error) {
      console.error("Qualify error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setQualifyingId(null);
    }
  };

  const handlePlayRecording = (recordingUrl, id) => {
    if (!recordingUrl) {
      toast({
        title: "No Recording",
        description: "No audio URL available for this call.",
        variant: "destructive"
      });
      return;
    }

    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(recordingUrl);
    audioRef.current = audio;

    audio.play().then(() => {
      setPlayingId(id);
      toast({ title: "Playing", description: "Audio recording started." });
    }).catch(err => {
      console.error("Playback error:", err);
      toast({ title: "Error", description: "Failed to play recording.", variant: "destructive" });
      setPlayingId(null);
    });

    audio.onended = () => {
      setPlayingId(null);
    };
  };

  // --- TAB COMPONENT ---
  const TabButton = ({ id, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-4 py-2 text-sm font-medium transition-all rounded-md ${activeTab === id
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }`}
    >
      {label}
      {activeTab === id && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-md bg-blue-600 -z-10"
        />
      )}
    </button>
  );

  return (
    <div className="space-y-6 p-4 bg-slate-950  min-h-screen text-slate-100">
      <div className="sticky top-0 z-30 bg-slate-950 p-4 space-y-10">
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
        </div>
        


        {/* --- NEW: TABS SECTION --- */}
        <div className=" hidden md:flex md:flex-row flex-col  items-center gap-2 p-1 bg-slate-900/50 rounded-lg md:w-fit w-full border border-slate-800">
          <TabButton id="all" label="All Calls" />
          <TabButton id="incoming" label="Incoming" />
          <TabButton id="outgoing" label="Outgoing" />
          <TabButton id="rnr" label="RNR" />
        </div>
      </div>

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
                {!loading && filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter className="w-8 h-8 opacity-50" />
                        <p>No {activeTab === 'all' ? '' : activeTab} logs found.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredLogs.map((call, index) => (
                  <motion.tr
                    key={call._id || call.cmiuuid || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {call.status === 'missed' ? (
                        <PhoneMissed className="w-5 h-5 text-red-400" />
                      ) : call.direction === 'inbound' || call.direction === 'incoming' ? (
                        <PhoneIncoming className="w-5 h-5 text-green-400" />
                      ) : (
                        <PhoneOutgoing className="w-5 h-5 text-blue-400" />
                      )}
                    </td>

                    <td className="py-3 px-4 text-sm font-medium text-white">
                      {call.direction === 'inbound' ? call.from : (call.user || "Agent")}
                    </td>

                    <td className="py-3 px-4 text-sm text-slate-300">
                      {call.direction === 'inbound' ? call.to : call.to}
                    </td>

                    <td className="py-3 px-4 text-sm text-slate-300">
                      {formatTime(call.callDate || call.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-sm text-slate-300">
                      {formatDuration(call.answeredsec || call.duration)}
                    </td>

                    <td className="py-3 px-4">
                      <Badge className={`${statusColors[call.status] || 'bg-gray-600'} capitalize`}>
                        {call.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      {(call.recordingUrl || call.filename) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayRecording(call.recordingUrl, call.cmiuuid)}
                          className={`hover:bg-fuchsia-900/20 ${playingId === call.cmiuuid ? 'text-green-400' : 'text-fuchsia-300 hover:text-fuchsia-200'}`}
                        >
                          {playingId === call.cmiuuid ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-600">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {call.status === 'answered' && (
                        // <Button
                        //   size="sm"
                        //   variant="outline"
                        //   // onClick={() => handleQualify(call._id)}
                        //   onClick={() => {
                        //     setFormData({
                        //       name: call.from || '',
                        //       phone: call.to || '',
                        //       email: '',
                        //       notes: '',
                        //     });
                        //     setPopupOpen(true);
                        //   }}
                        //   disabled={qualifyingId === call._id}
                        //   className="border-blue-800 bg-blue-900/20 text-blue-300 hover:bg-blue-800 hover:text-white min-w-[90px]"
                        // >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setLeadInitialData({

                              leadPhone: call.from || ""
                            });
                            setLeadDialogOpen(true);
                          }}
                        >

                          {qualifyingId === call._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5 mr-2" />
                              Qualify
                            </>
                          )}
                        </Button>
                      )}
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      {/* //card for mobile view */}
      <Card className="bg-slate-900 border-slate-800 md:hidden">
        <CardContent className="p-6">
          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-4">
            {loading && filteredLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <Filter className="w-8 h-8 opacity-50 mx-auto" />
                No {activeTab === 'all' ? '' : activeTab} logs found.
              </div>
            ) : (
              filteredLogs.map((call, index) => (
                <motion.div
                  key={call._id || call.cmiuuid || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="
  bg-slate-900
          border border-slate-700
          rounded-xl
          p-4
          shadow-lg
          hover:bg-slate-800
          transition-all
        "
                >
                  {/* HEADER: TYPE + STATUS */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      {call.status === 'missed' ? (
                        <PhoneMissed className="w-6 h-6 text-red-400" />
                      ) : call.direction === 'inbound' || call.direction === 'incoming' ? (
                        <PhoneIncoming className="w-6 h-6 text-green-400" />
                      ) : (
                        <PhoneOutgoing className="w-6 h-6 text-blue-400" />
                      )}
                    </div>

                    <Badge className={`${statusColors[call.status] || 'bg-gray-600'} capitalize`}>
                      {call.status}
                    </Badge>
                  </div>

                  {/* CALLER */}
                  <div className="flex items-center gap-2 mb-2 text-white">
                    <User className="w-4 h-4 text-purple-300" />
                    <span>{call.direction === 'inbound' ? call.from : (call.user || 'Agent')}</span>
                  </div>

                  {/* NUMBER */}
                  <div className="flex items-center gap-2 mb-2 text-fuchsia-300 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{call.to}</span>
                  </div>

                  {/* TIME */}
                  <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(call.callDate || call.createdAt)}</span>
                  </div>

                  {/* DURATION */}
                  <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
                    <Hourglass className="w-4 h-4" />
                    <span>{formatDuration(call.answeredsec || call.duration)}</span>
                  </div>

                  {/* RECORDING + ACTIONS */}
                  <div className="flex justify-between items-center border-t border-slate-700 pt-3">
                    {/* PLAY BUTTON */}
                    {(call.recordingUrl || call.filename) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayRecording(call.recordingUrl, call.cmiuuid)}
                        className={`
                hover:bg-fuchsia-900/20
                ${playingId === call.cmiuuid ? 'text-green-400' : 'text-fuchsia-300 hover:text-fuchsia-200'}
              `}
                      >
                        {playingId === call.cmiuuid ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-600">No Recording</span>
                    )}

                    {/* QUALIFY */}
                    {call.status === 'answered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setLeadInitialData({

                            leadPhone: call.from || ""
                          });
                          setLeadDialogOpen(true);
                        }}
                      >

                        {qualifyingId === call._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 mr-2" />
                            Qualify
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

        </CardContent>
      </Card>


      <LeadDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        mode="create"
        initialData={leadInitialData}
        onSuccess={() => {
          toast({
            title: "Lead Created",
            description: "Lead saved successfully",
            variant: "success",
          });
          setLeadDialogOpen(false);
        }}
      />

    </div >
  );
}

export default function CallLogs() {
  return (
    <ToastProvider>
      <CallLogsContent />
    </ToastProvider>
  );
}