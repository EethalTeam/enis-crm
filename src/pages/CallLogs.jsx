import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence, color } from "framer-motion";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Loader2,
  Pause,
  X,
  UserPlus,
  Filter,
  User,
  Phone,
  Clock,
  Hourglass,
  Download,
  PhoneCall,
  ArrowUpFromLine,
  Search,
} from "lucide-react";
import { config } from "@/components/CustomComponents/config.js";
import { LeadDialogWrapper } from "@/pages/Leads";
import PIOPIY from "piopiyjs";
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

// --- Inline UI Components ---
const Card = ({ className, children }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ className, children }) => (
  <div className={className}>{children}</div>
);
const Badge = ({ className, children }) => (
  <div
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
  >
    {children}
  </div>
);
const Button = ({
  className,
  variant = "default",
  size = "default",
  onClick,
  disabled,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-slate-800 hover:text-slate-100",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.default} ${
        sizes[size] || sizes.default
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// --- Toast Implementation ---
const ToastContext = createContext({});
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description, variant = "default" }) => {
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
              className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${
                t.variant === "destructive"
                  ? "bg-red-900/90 border-red-800 text-white"
                  : t.variant === "success"
                  ? "bg-green-900/90 border-green-800 text-white"
                  : "bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-sm"
              }`}
            >
              <div>
                {t.title && (
                  <h4 className="font-semibold text-sm">{t.title}</h4>
                )}
                {t.description && (
                  <p className="text-sm opacity-90 mt-1">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-slate-400 hover:text-white"
              >
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

// --- Styles ---
const statusColors = {
  answered: "bg-green-600 text-white hover:bg-green-700 border-transparent",
  missed: "bg-red-600 text-white hover:bg-red-700 border-transparent",
  failed: "bg-slate-600 text-white hover:bg-slate-700 border-transparent",
  busy: "bg-orange-500 text-white hover:bg-orange-600 border-transparent",
};

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const formatTime = (isoString) => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function CallLogsContent() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  // Added Search State
  const [searchQuery, setSearchQuery] = useState("");

  const piopiyRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const TelecmiID = decode(localStorage.getItem("TelecmiID"));
  const TelecmiPassword = decode(localStorage.getItem("TelecmiPassword"));

  const [callStatus, setCallStatus] = useState("Idle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  const audioRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadInitialData, setLeadInitialData] = useState(null);

  const resetCallState = () => {
    setCallStatus("Idle");
    setPhoneNumber("");
    setIsMuted(false);
    setIsOnHold(false);
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (!piopiyRef.current && TelecmiID && TelecmiPassword) {
      piopiyRef.current = new PIOPIY({
        name: "Eethal CRM Agent",
        debug: false,
        autoplay: true,
        ringTime: 60,
      });

      const sdk = piopiyRef.current;
      sdk.on("login", () => setIsLoggedIn(true));
      sdk.on("loginFailed", (res) => {
        if (
          res &&
          (res.code == 200 || res.msg === "User loged in successfully")
        ) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      });

      sdk.on("trying", () => setCallStatus("Calling..."));
      sdk.on("ringing", () => setCallStatus("Ringing..."));
      sdk.on("answered", () => setCallStatus("Connected"));
      sdk.on("ended", () => resetCallState());
      sdk.on("cancel", () => resetCallState());

      setTimeout(async () => {
        if (isMountedRef.current && piopiyRef.current && !isLoggedIn) {
          try {
            piopiyRef.current.login(
              TelecmiID,
              TelecmiPassword,
              "sbcind.telecmi.com"
            );
          } catch (err) {
            console.error("SDK Login Error:", err);
          }
        }
      }, 800);
    }

    const performFreshLogin = async () => {
      if (piopiyRef.current && isMountedRef.current && !isLoggedIn) {
        try {
          await piopiyRef.current.logout();
          setTimeout(() => {
            if (isMountedRef.current) {
              piopiyRef.current.login(
                TelecmiID,
                TelecmiPassword,
                "sbcind.telecmi.com"
              );
            }
          }, 500);
        } catch (err) {
          console.error(err);
        }
      }
    };

    if (!isLoggedIn) performFreshLogin();

    return () => {
      isMountedRef.current = false;
      if (piopiyRef.current) {
        piopiyRef.current.logout();
        piopiyRef.current = null;
      }
    };
  }, []);

  const handleInitiateCall = (rawNumber) => {
    if (!isLoggedIn)
      return toast({
        title: "Connecting",
        description: "Dialer is not ready.",
        variant: "destructive",
      });
    const numStr = String(rawNumber || "");
    if (!numStr || numStr === "undefined")
      return toast({
        title: "Error",
        description: "No phone number found",
        variant: "destructive",
      });

    let cleanNumber = numStr.replace(/\D/g, "");
    if (!cleanNumber.startsWith("91")) cleanNumber = "91" + cleanNumber;

    setPhoneNumber(cleanNumber);
    toast({
      title: "Calling...",
      description: `Dialing ${cleanNumber}`,
      variant: "success",
    });
    if (piopiyRef.current) {
      try {
        piopiyRef.current.call(cleanNumber);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleHangup = () => {
    if (piopiyRef.current) piopiyRef.current.terminate();
    resetCallState();
  };

  const toggleMute = () => {
    if (!piopiyRef.current) return;
    isMuted ? piopiyRef.current.unMute() : piopiyRef.current.mute();
    setIsMuted(!isMuted);
  };

  const toggleHold = () => {
    if (!piopiyRef.current) return;
    isOnHold ? piopiyRef.current.unHold() : piopiyRef.current.hold();
    setIsOnHold(!isOnHold);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      const role = localStorage.getItem("role");
      const TelecmiID = decode(localStorage.getItem("TelecmiID"));
      try {
        let url = config.Api + "CallLogs/getAllCallLogs";
        const payload = role === "AGENT" ? { TelecmiID, role } : {};

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        console.log(data, "data");
        setLogs(data.data || data.calls || []);
      } catch (err) {
        setLogs([
          {
            _id: "mock1",
            from: "919876543210",
            to: "918888888888",
            status: "answered",
            direction: "inbound",
            answeredsec: 323,
            callDate: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // --- Updated Filter Logic with Search ---
  const getFilteredLogs = () => {
    let currentLogs = logs;

    // 1. Filter by Tab
    switch (activeTab) {
      case "incoming":
        currentLogs = logs.filter(
          (log) => log.direction === "inbound" || log.direction === "incoming"
        );
        break;
      case "outgoing":
        currentLogs = logs.filter(
          (log) => log.direction === "outbound" || log.direction === "outgoing"
        );
        break;
      case "rnr":
        currentLogs = logs.filter(
          (log) => log.status === "missed" || log.status === "busy"
        );
        break;
      default:
        break;
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      currentLogs = currentLogs.filter((log) => {
        const targetNumber =
          log.direction === "inbound" || log.direction === "incoming"
            ? log.from
            : log.to;
        return targetNumber && targetNumber.toString().includes(query);
      });
    }

    return currentLogs;
  };

  const filteredLogs = getFilteredLogs();

  const handlePlayRecording = (recordingUrl, id) => {
    if (!recordingUrl) return;
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(recordingUrl);
    audioRef.current = audio;
    audio.play().then(() => {
      setPlayingId(id);
    });
    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const exportCallLogsToExcel = () => {
    if (!filteredLogs.length) return;
    const excelData = filteredLogs.map((call, index) => ({
      "S.No": index + 1,
      "Call Type": call.direction === "inbound" ? "Incoming" : "Outgoing",
      Caller: call.direction === "inbound" ? call.from : call.user || "Agent",
      "Phone Number": call.to || "",
      Status: call.status || "",
      "Call Time": new Date(call.callDate).toLocaleString("en-IN"),
      Duration: formatDuration(call.answeredsec),
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Call Logs");
    XLSX.writeFile(workbook, `CallLogs_${activeTab}.xlsx`);
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-4 py-2 text-sm font-medium transition-all rounded-md ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
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

  const popupStyles = {
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    card: {
      background: "white",
      padding: "30px",
      borderRadius: "15px",
      textAlign: "center",
      width: "320px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    },
    status: { color: "#2563EB", fontWeight: "bold", marginBottom: "10px" },
    num: {
      fontSize: "22px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "20px",
    },
    btnGroup: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginBottom: "15px",
    },
    btn: {
      background: "#f0f0f0",
      border: "none",
      padding: "10px",
      borderRadius: "8px",
      cursor: "pointer",
      color: "black",
    },
    btnEnd: {
      background: "#EF4444",
      color: "white",
      border: "none",
      padding: "12px",
      borderRadius: "8px",
      cursor: "pointer",
      width: "100%",
      fontWeight: "bold",
    },
  };

  return (
    <div className="space-y-6 p-4 bg-slate-950 min-h-screen text-slate-100">
      {/* OUTGOING CALL POPUP */}
      {callStatus !== "Idle" && (
        <div style={popupStyles.modal}>
          <div style={popupStyles.card}>
            <div style={popupStyles.status}>{callStatus}</div>
            <div style={popupStyles.num}>{phoneNumber}</div>
            {callStatus === "Connected" && (
              <div style={popupStyles.btnGroup}>
                <button onClick={toggleMute} style={popupStyles.btn}>
                  {isMuted ? "🔇 Unmute" : "🎤 Mute"}
                </button>
                <button onClick={toggleHold} style={popupStyles.btn}>
                  {isOnHold ? "▶ Resume" : "⏸ Hold"}
                </button>
              </div>
            )}
            <button onClick={handleHangup} style={popupStyles.btnEnd}>
              End Call
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-slate-950 p-4 space-y-10">
        <div className="flex md:flex-row flex-col items-start md:items-center space-y-4 justify-between">
          <div className="flex items-center gap-4">
            <h1 className="md:text-3xl text-2xl font-bold text-white">
              Call Logs
            </h1>
            {loading && <Loader2 className="animate-spin text-white" />}
          </div>
          <div className="flex gap-3">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
                isLoggedIn
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/30 text-red-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isLoggedIn ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              />
              {isLoggedIn ? "Dialer Ready" : "Dialer Offline"}
            </div>
            {["Admin", "superadmin"].includes(localStorage.getItem("role")) && (
              <Button
                variant="outline"
                onClick={exportCallLogsToExcel}
                className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
              >
                <ArrowUpFromLine className="w-4 h-4 mr-2" /> Export
              </Button>
            )}
          </div>
        </div>

        {/* --- Search and Filters --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-3">
          {/* Filter Tabs */}
          <div className="hidden md:flex items-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800">
            <TabButton id="all" label="All Calls" />
            <TabButton id="incoming" label="Incoming" />
            <TabButton id="outgoing" label="Outgoing" />
            <TabButton id="rnr" label="RNR" />
          </div>

          {/* Mobile Select */}
          <div className="md:hidden w-full">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full h-11 rounded-md bg-slate-900 border border-slate-700 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Calls</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="rnr">RNR</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 h-10 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="bg-slate-900 border-slate-800 hidden md:block">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-slate-300">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Caller</th>
                  <th className="text-left py-3 px-4 font-semibold">Number</th>
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Recording
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((call, index) => {
                    const targetNumber =
                      call.direction === "inbound" ||
                      call.direction === "incoming"
                        ? call.from
                        : call.to;
                    return (
                      <tr
                        key={call._id || index}
                        className="border-b border-slate-800 hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-4">
                          {call.status === "missed" ? (
                            <PhoneMissed className="w-5 h-5 text-red-400" />
                          ) : call.direction === "inbound" ||
                            call.direction === "incoming" ? (
                            <PhoneIncoming className="w-5 h-5 text-green-400" />
                          ) : (
                            <PhoneOutgoing className="w-5 h-5 text-blue-400" />
                          )}
                        </td>
                        {/* <td className="py-3 px-4 font-medium text-white">{targetNumber || "Unknown"}</td> */}
                        <td className="py-3 px-4 font-medium">
                          {call.leadName ? (
                            <span className="text-white font-semibold">
                              {call.leadName}
                            </span>
                          ) : (
                            <span className="text-white">
                              {targetNumber || "Unknown"}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 group">
                            <span>{targetNumber}</span>
                            <button
                              onClick={() => handleInitiateCall(targetNumber)}
                              className="p-1.5 rounded-full bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <PhoneCall size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {formatTime(call.callDate)}
                        </td>
                        <td className="py-3 px-4">
                          {formatDuration(call.answeredsec)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[call.status]}>
                            {call.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {call.recordingUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handlePlayRecording(call.recordingUrl, call._id)
                              }
                              className={
                                playingId === call._id
                                  ? "text-green-400"
                                  : "text-fuchsia-300"
                              }
                            >
                              {playingId === call._id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!call.leadName}
                            className={
                              call.leadName
                                ? "opacity-50 cursor-not-allowed"
                                : " "
                            }
                            onClick={() => {
                              if (call.leadName)
                                return setLeadInitialData({
                                  leadCreatedById: decode(
                                    localStorage.getItem("EmployeeId")
                                  ),
                                  leadPhone: targetNumber || "",
                                });
                              setLeadDialogOpen(true);
                            }}
                          >
                            Qualify
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((call, index) => {
            const targetNumber =
              call.direction === "inbound" || call.direction === "incoming"
                ? call.from
                : call.to;
            return (
              <div
                key={call._id || index}
                className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg"
              >
                <div className="flex justify-between items-center mb-3">
                  {call.direction === "inbound" ||
                  call.direction === "incoming" ? (
                    <PhoneIncoming className="w-6 h-6 text-green-400" />
                  ) : (
                    <PhoneOutgoing className="w-6 h-6 text-blue-400" />
                  )}
                  <Badge className={statusColors[call.status]}>
                    {call.status}
                  </Badge>
                </div>
                {/* <div className="flex items-center gap-2 mb-2 text-white"><User className="w-4 h-4" /> {targetNumber}</div> */}
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {call.leadName ? (
                    <span className="text-white font-semibold">
                      {call.leadName}
                    </span>
                  ) : (
                    <span className="text-white">{targetNumber}</span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-fuchsia-300 text-sm">
                    <Phone className="w-4 h-4" /> {targetNumber}
                  </div>
                  <button
                    onClick={() => handleInitiateCall(targetNumber)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold"
                  >
                    <PhoneCall size={12} /> Call
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-xs mb-3">
                  <Clock className="w-4 h-4" /> {formatTime(call.callDate)} |{" "}
                  <Hourglass className="w-4 h-4" />{" "}
                  {formatDuration(call.answeredsec)}
                </div>
                <div className="flex gap-2 border-t border-slate-700 pt-3">
                  {call.recordingUrl && (
                    <Button
                      className="flex-1"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePlayRecording(call.recordingUrl, call._id)
                      }
                    >
                      {playingId === call._id ? "Pause" : "Play"}
                    </Button>
                  )}
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!!call.leadName}
                      className={
                        call.leadName ? "opacity-50 cursor-not-allowed" : " "
                      }
                      onClick={() => {
                        if (call.leadName)
                          return setLeadInitialData({
                            leadCreatedById: decode(
                              localStorage.getItem("EmployeeId")
                            ),
                            leadPhone: targetNumber || "",
                          });
                        setLeadDialogOpen(true);
                      }}
                    >
                      Qualify
                    </Button>
                  </td>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-500">No logs found</div>
        )}
      </div>

      <LeadDialogWrapper
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        mode="create"
        initialData={leadInitialData}
        onSuccess={() => {
          toast({ title: "Lead Created", variant: "success" });
          setLeadDialogOpen(false);
        }}
      />
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
