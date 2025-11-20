import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Loader2, Pause, X } from 'lucide-react';
import { config } from '@/components/CustomComponents/config.js';

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

const Button = ({ className, variant = "default", size = "default", onClick, children }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
  };
  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      onClick={onClick}
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

    // Auto-dismiss after 3 seconds
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
              className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${
                t.variant === 'destructive' 
                  ? 'bg-red-900/90 border-red-800 text-white' 
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

// Helper to format seconds into MM:SS
const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Helper to format date
const formatTime = (isoString) => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function CallLogsContent() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  
  // Ref to store the current audio instance so we can stop it later
  const audioRef = useRef(null);
  // State to track which log is currently playing (to toggle icon)
  const [playingId, setPlayingId] = useState(null);

  // Fetch Logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Using POST method as requested
        let url = config.Api + "CallLogs/getAllCallLogs";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            page: 1,
            limit: 50 // Fetch first 50 logs
          }), 
        });

        if (!response.ok) throw new Error('Failed to fetch logs');

        const data = await response.json();
        // Assuming your API returns { success: true, data: [...] } or just [...]
        const logData = data.data || data.calls || []; 
        setLogs(logData);
      } catch (err) {
        console.error(err);
        setError(err.message);
        // Mock data for preview if API fails
        setLogs([
            { cmiuuid: '1', from: 'John Doe', to: '+1234567890', status: 'answered', direction: 'inbound', answeredsec: 323, callDate: new Date().toISOString(), custom: 'Interested', recordingUrl: 'https://www.soundhelix.com/examples/mp3/Soundhelix-Song-1.mp3' },
        ]);
        // Use timeout to ensure toast provider is ready
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

    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Removed toast from dependency array to avoid loops

  // --- NEW PLAY FUNCTION ---
  const handlePlayRecording = (recordingUrl, id) => {
    if (!recordingUrl) {
      toast({
        title: "No Recording",
        description: "No audio URL available for this call.",
        variant: "destructive"
      });
      return;
    }

    // If the clicked audio is already playing, pause it
    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      }
      return;
    }

    // Stop currently playing audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create and play new audio
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

    // Reset state when audio finishes
    audio.onended = () => {
      setPlayingId(null);
    };
  };

  return (
    <div className="space-y-6 p-4 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Call Logs</h1>
        {loading && <Loader2 className="animate-spin text-white" />}
      </div>

      <Card className="bg-slate-900 border-slate-800">
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Disposition</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Recording</th>
                </tr>
              </thead>
              <tbody>
                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">
                      No call logs found.
                    </td>
                  </tr>
                )}
                
                {logs.map((call, index) => (
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

                    <td className="py-3 px-4 text-sm text-slate-300">
                      {call.custom && call.custom !== "null" ? call.custom : "-"}
                    </td>

                    <td className="py-3 px-4">
                      {/* Use call.recordingUrl which comes from backend */}
                      {(call.recordingUrl || call.filename) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePlayRecording(call.recordingUrl, call.cmiuuid)} 
                          className={`hover:bg-fuchsia-900/20 ${playingId === call.cmiuuid ? 'text-green-400' : 'text-fuchsia-300 hover:text-fuchsia-200'}`}
                        >
                          {playingId === call.cmiuuid ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
    </div>
  );
}

// Wrap the component with the ToastProvider
export default function CallLogs() {
  return (
    <ToastProvider>
      <CallLogsContent />
    </ToastProvider>
  );
}