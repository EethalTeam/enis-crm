import React, { useState, useEffect, useReducer, useCallback, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Eye, Heart, X, ChevronDown, MapPin, UserPlus, 
  RefreshCw, Filter, Building2, User, Footprints, Building
} from 'lucide-react';

const decode = (value) => {
  if (!value) return "";
  try {
    return atob(value);
  } catch (err) {
    console.error("Decode failed:", err);
    return "";
  }
};

// --- CONFIGURATION ---
import { config } from '@/components/CustomComponents/config.js';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";

// --- TOAST & NOTIFICATION SYSTEM ---
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
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
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

// --- UI COMPONENTS ---

const Card = ({ className, children }) => (
  <div className={`rounded-lg border bg-slate-900 border-slate-800 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ className, variant = "default", size = "default", onClick, disabled, children }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    ghost: "hover:bg-slate-800 text-slate-100",
  };
  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.default} h-10 px-4 py-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Label = ({ children }) => (
  <label className="text-sm font-medium leading-none text-slate-300 block mb-2">
    {children}
  </label>
);

const Dialog = ({ open, onOpenChange, children }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />
        {children}
      </div>
    )}
  </AnimatePresence>
);

const DialogContent = ({ className, children, title, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
    className={`relative z-50 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-lg flex flex-col ${className}`}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
    </div>
    {children}
  </motion.div>
);

// --- REDUCER ---
const initialState = {
  _id: '',
  siteId: '', // Added Site ID
  statusId:'',
  statusName:'',
  visitorId:'',
  visitorName:'',
  UnitName:'',
  unitId:''
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'text': return { ...state, [action.name]: action.value };
    case 'select': return { ...state, [action.name]: action.value };
    case 'reset': return initialState;
    default: return state;
  }
};

// --- MAIN COMPONENT ---

function PlotViewContent() {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  // Data States
  const [plotView, setPlotView] = useState([]);
  const [filteredPlots, setFilteredPlots] = useState([]);
  const [siteData, setSiteData] = useState([]); // Site Dropdown
  const [unitData, setUnitData] = useState([]); // Units Dropdown
  const [visitorData, setVisitorData] = useState([]); // Visitor Dropdown
  const [loading, setLoading] = useState(false);
  
  // UI States
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openVisitorModal, setOpenVisitorModal] = useState(false);
  const [viewData, setViewData] = useState({});

  const role = localStorage.getItem('role')
    const { getPermissionsByPath } = useAuth();
    const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false })
  
  // Status Reference
  const [plotStatuses] = useState([
    { PlotStatusName: "Visited", colorCode: '#3b82f6' }, // Blue
    { PlotStatusName: "Interested", colorCode: '#eab308' }, // Yellow
    { PlotStatusName: "Hold By", colorCode: '#f97316' }, // Orange
    { PlotStatusName: "Reserved By", colorCode: '#a855f7' }, // Purple
    { PlotStatusName: "Booked By", colorCode: '#22c55e' }, // Green
    { PlotStatusName: "Sold To", colorCode: '#ef4444' }, // Red
    { PlotStatusName: "Available", colorCode: '#64748b' } // Slate/Grey
  ]);

  const clickTimeoutRef = useRef(null);

  // --- API CALLS ---

  useEffect(() => {
    getSites();
    getUnitList();
    getPlotView();
  }, []);

  // Refetch when Site or Unit Filter changes
  useEffect(() => {
    // When filters change, refetch data
    getPlotView();
  }, [state.siteId, state.unitId]);

  // Filter plots locally when Status Filter changes
  useEffect(() => {
    if (selectedStatus === "All") {
      setFilteredPlots(plotView);
    } else {
      setFilteredPlots(plotView.filter(p => p?.statusId?.statusName === selectedStatus));
    }
  }, [selectedStatus, plotView]);

  const getSites = async () => {
    try {
             const role = localStorage.getItem("role");
    const _id = decode(localStorage.getItem("SiteId")); 
                 const payload =  role === "AGENT"   ? { _id }   : {};   
      const response = await fetch(config.Api + "Site/getAllSites", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setSiteData(result.data || result);
    } catch (error) { console.error(error); }
  };

  const getUnitList = async () => {
    try {
      const response = await fetch(config.Api + "Unit/getAllUnits/", {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
      });
      const result = await response.json();
      setUnitData(result || []);
    } catch (error) { console.error(error); }
  };


  //   useEffect(() => {
  //     getPermissionsByPath(window.location.pathname).then(res => {
  //       if (res) {
  //         console.log(res, "res")
  //         setPermissions(res)
  //       } else {
  //         navigate('/dashboard')
  //       }
  //     })
  
  //   }, [])
  
  // useEffect(()=>{
  //     if (Permissions.isView) {
      
  //     }
  // },[Permissions])

  const getPlotView = async () => {
    try {
       const role = localStorage.getItem("role");
    const siteId = decode(localStorage.getItem("SiteId")); 
      setLoading(true);
      
      let url = config.Api + "Plot/getAllPlots";
       const payload={};   
      // Payload now includes both siteId and unitId
      if (state.siteId || siteId) payload.siteId = role === "AGENT" ? siteId : state.siteId;
      if (state.unitId) payload.unitId = state.unitId;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to get Plots');
      const result = await response.json();
      
      const data = result.data || [];
      setPlotView(data);
      setFilteredPlots(data); // This triggers the status filter effect
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisitor = async () => {
    try {
      const response = await fetch(config.Api + "Plot/getAllVisitors/", {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
      });
      const result = await response.json();
      setVisitorData(result || []);
    } catch (error) { console.error(error); }
  };

  const updatePlotStatus = async (data) => {
    try {
      setLoading(true);
      const response = await fetch(config.Api + "Plot/updatePlotStatus", {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (response.status !== 200) {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: result.message, variant: 'success' });
        setOpenVisitorModal(false);
        getPlotView(); // Refresh Data
        // Don't fully reset, or we lose filters
        dispatch({ type: 'text', name: '_id', value: '' }); 
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER ---
  const getFilteredUnits = () => {
      if (!state.siteId) return unitData;
      return unitData.filter(u => {
          // Handle if siteId is populated object or just ID
          const uSiteId = u.siteId?._id || u.siteId; 
          return uSiteId === state.siteId;
      });
  };

  // --- LOGIC HANDLERS ---

  const handlePlotClick = (row) => {
    if (clickTimeoutRef.current !== null) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      handleAddVisitor(row);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        handleView(row);
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const handleView = (row) => {
    setViewData({
      "Site": row.unitId?.siteId?.sitename || row.siteId?.sitename || '-',
      "Plot Number": row.plotNumber,
      "Unit": row.unitId?.UnitName || '-',
      "Plot Dimension": row.dimension,
      "Plot Facing": row.facing,
      "Landmark": row.landmark,
      "Road": row.road,
      "Status": row.statusId?.statusName,
      "Area": `${row.areaInSqFt} sq.ft`,
      "Cents": row.cents
    });
    setOpenViewModal(true);
  };

  const handleAddVisitor = (row) => {
    dispatch({ type: 'text', name: '_id', value: row._id });
    setOpenVisitorModal(true);
  };

  const handleVisitorSubmit = () => {
    if (!state.statusName || !state.visitorId) {
      toast({ title: 'Validation Error', description: 'Please select Status and Visitor', variant: 'destructive' });
      return;
    }

    const updateData = { plotId: state._id };
    if(state.statusName === 'Sold To') updateData.soldToVisitorId = state.visitorId;
    else if(state.statusName === 'Reserved By') updateData.reservedBy = state.visitorId;
    else if(state.statusName === 'Hold By') updateData.holdBy = state.visitorId;
    else if(state.statusName === 'Booked By') updateData.bookedBy = state.visitorId;
    else if(state.statusName === 'Interested') updateData.interestedBy = state.visitorId;
    else if(state.statusName === 'Visited') updateData.visitedBy = state.visitorId;

    updatePlotStatus(updateData);
  };

  // --- DYNAMIC STATUS COUNTS ---
  const uniqueStatusCounts = React.useMemo(() => {
    const counts = plotView.reduce((acc, plot) => {
      const name = plot.statusId?.statusName || 'Unknown';
      const color = plot.statusId?.colorCode || '#64748b';
      if (!acc[name]) acc[name] = { count: 0, color };
      acc[name].count += 1;
      return acc;
    }, {});

    return [
      { name: 'All', count: plotView.length, color: '#334155' },
      ...Object.entries(counts).map(([name, data]) => ({ name, count: data.count, color: data.color }))
    ];
  }, [plotView]);


  // --- RENDER ---
  return (
    <div className=" bg-slate-950 min-h-screen p-4 text-slate-100">
      
      {/* HEADER */}
            <div className="sticky top-0 z-30 bg-slate-950 pb-4 space-y-10 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Plot View</h1>
        <Button variant="outline" onClick={() => getPlotView()} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
           <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>
      

      {/* FILTERS & CONTROLS */}
      <Card>
         <div className="p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            
            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
               {uniqueStatusCounts.map((status) => (
                  <button
                    key={status.name}
                    onClick={() => setSelectedStatus(status.name)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        selectedStatus === status.name 
                        ? 'border-white shadow-lg scale-105' 
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: status.color, color: 'white' }}
                  >
                    {status.name}
                    <span className="ml-2 bg-black/20 px-1.5 rounded-md text-[10px]">{status.count}</span>
                  </button>
               ))}
            </div>

            {/* Filters Group */}
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                
                {/* Site Dropdown */}
                <div className="relative w-35 md:w-35 shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-slate-400" />
                    </div>

                      
                       <select
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 pl-10 pr-8 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none"
                        value={state.siteId}
                        onChange={(e) => {
                            dispatch({ type: 'text', name: 'siteId', value: e.target.value });
                            // Reset Unit when site changes
                            dispatch({ type: 'text', name: 'unitId', value: '' });
                            dispatch({ type: 'text', name: 'UnitName', value: '' });
                        }}
                    >
                        <option value="">All Sites</option>
                        {siteData.map((s) => (
                            <option key={s._id} value={s._id}>{s.sitename}</option>
                        ))}
                    </select>
                    
                   
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Unit Dropdown */}
                <div className="relative w-35 md:w-35 shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 pl-10 pr-8 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none disabled:opacity-50"
                        value={state.unitId}
                        onChange={(e) => {
                            const selectedUnit = unitData.find(u => u._id === e.target.value);
                            dispatch({ type: 'text', name: 'unitId', value: e.target.value });
                            dispatch({ type: 'text', name: 'UnitName', value: selectedUnit?.UnitName || '' });
                        }}
                    >
                        <option value="">All Units</option>
                        {getFilteredUnits().map((u) => (
                            <option key={u._id} value={u._id}>{u.UnitName}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
            </div>
         </div>
      </Card>
      </div>

      {/* PLOT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {filteredPlots.length > 0 ? (
            filteredPlots.map((plot) => (
               <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={plot._id}
                  onClick={() => handlePlotClick(plot)}
                  className="group relative flex flex-col justify-between rounded-xl p-1 cursor-pointer transition-all duration-300 hover:z-10 hover:shadow-2xl hover:scale-105 overflow-hidden"
                  style={{ 
                      background: `linear-gradient(145deg, ${plot.statusId?.colorCode || '#334155'}, #1e293b)`,
                      boxShadow: `0 4px 12px -2px ${plot.statusId?.colorCode}66`
                  }}
               >
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 w-48 bg-slate-950/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-2xl p-3 text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 transform translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                          <div className="w-2 h-2 rounded-full" style={{ background: plot.statusId?.colorCode }}></div>
                          <span className="font-bold text-white">Plot {plot.plotNumber}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                         <span className="text-slate-400">Code:</span> <span className="text-right text-white">{plot.plotCode}</span>
                         <span className="text-slate-400">Unit:</span> <span className="text-right text-white truncate">{plot.unitId?.UnitName}</span>
                         <span className="text-slate-400">Area:</span> <span className="text-right text-white">{plot.areaInSqFt}</span>
                         <span className="text-slate-400">Status:</span> <span className="text-right text-white truncate">{plot.statusId?.statusName}</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
                  </div>

                  {/* Card Header */}
                  <div className="flex justify-between items-start p-1.5"></div>
                  
                  {/* Card Body */}
                  <div className="flex flex-col justify-center items-center h-18 pb-1">
                      <h3 className="text-lg font-extrabold text-white drop-shadow-md tracking-tight">
                         {plot.plotNumber}
                      </h3>
                  </div>

                  {/* Card Footer */}
                  <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-1.5 mt-1 border-t border-white/5">
                      <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
                         <Eye className="w-3 h-3 text-white-400 fill-gray-400" />
                         <span>{plot.visitDetails?.length || 0}</span>
                      </div>
                      <div className="h-3 w-[1px] bg-white/20"></div>
                      <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
                         <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                         <span>{plot.interestDetails?.length || 0}</span>
                      </div>
                  </div>
               </motion.div>
            ))
         ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
               <Filter className="w-10 h-10 mb-3 opacity-20" />
               <p>No plots found for this selection.</p>
               <Button variant="ghost" onClick={() => { setSelectedStatus("All"); dispatch({type:'reset'}); getPlotView(); }} className="mt-2 text-fuchsia-400 hover:text-fuchsia-300">
                  Clear Filters
               </Button>
            </div>
         )}
      </div>

      {/* --- MODAL: VIEW DETAILS --- */}
      <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
         <DialogContent className="sm:max-w-[400px]" title="Plot Details" onClose={() => setOpenViewModal(false)}>
            <div className="p-6 space-y-3">
               {Object.entries(viewData).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                      <span className="text-slate-400 font-medium text-sm">{key}</span>
                      <span className="text-white font-bold text-sm text-right">{val || '-'}</span>
                  </div>
               ))}
            </div>
         </DialogContent>
      </Dialog>

      {/* --- MODAL: ADD VISITOR --- */}
      <Dialog open={openVisitorModal} onOpenChange={setOpenVisitorModal}>
         <DialogContent className="sm:max-w-[500px]" title="Add Visitor" onClose={() => { setOpenVisitorModal(false); }}>
            <div className="p-6 space-y-4">
               {/* Status Selector */}
               <div>
                  <Label>Status <span className="text-red-500">*</span></Label>
                  <div className="relative">
                     <select 
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none"
                        value={state.statusName}
                        onChange={(e) => dispatch({ type: 'select', name: 'statusName', value: e.target.value })}
                     >
                        <option value="">Select Status</option>
                        {plotStatuses.map((s) => (
                           <option key={s.PlotStatusName} value={s.PlotStatusName}>{s.PlotStatusName}</option>
                        ))}
                     </select>
                     <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
               </div>

               {/* Visitor Selector */}
               <div>
                  <Label>Visitor <span className="text-red-500">*</span></Label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                     </div>
                     <select 
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 pl-10 pr-8 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none"
                        value={state.visitorId}
                        onClick={() => { if(visitorData.length === 0) getVisitor(); }}
                        onChange={(e) => {
                           const vis = visitorData.find(v => v._id === e.target.value);
                           dispatch({ type: 'text', name: 'visitorId', value: e.target.value });
                           if(vis) dispatch({ type: 'text', name: 'visitorName', value: vis.visitorName || vis['Visitor Name'] });
                        }}
                     >
                        <option value="">Select Visitor</option>
                        {visitorData.map((v, i) => (
                           <option key={v._id || i} value={v._id}>{v.visitorName || v['Visitor Name']}</option>
                        ))}
                     </select>
                     <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
               </div>

               <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
                  <Button variant="ghost" onClick={() => setOpenVisitorModal(false)}>Cancel</Button>
                  <Button onClick={handleVisitorSubmit} disabled={loading}>
                     {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                     {loading ? 'Updating...' : 'Update Status'}
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

    </div>
  );
}

export default function PlotView() {
   return (
     <ToastProvider>
       <PlotViewContent />
     </ToastProvider>
   );
}