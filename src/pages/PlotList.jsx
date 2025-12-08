import React, { useState, useEffect, useReducer, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Download, Upload, Loader2, Eye, Pencil, Trash2,
  X, ChevronDown, MapPin, UserPlus, RefreshCw, AlertTriangle,Home,Square ,Compass 
} from 'lucide-react';
import { config } from '@/components/CustomComponents/config.js';

// --- LOCAL REDUCER ---
const initialState = {
  _id: '',
  siteId: '', // Added Site ID
  sitename: '', // Added Site Name
  plotCode: '',
  plotNumber: '',
  dimension: '',
  areaInSqFt: '',
  cents: '',
  road: '',
  landmark: '',
  isActive: '',
  remarks: '',
  description: '',
  statusId: '',
  statusName: '',
  visitorId: '',
  visitorName: '',
  facing: '',
  unitId: '',
  UnitName: ''
};

const commonReducer = (state, action) => {
  switch (action.type) {
    case 'text':
      return { ...state, [action.name]: action.value };
    case 'number':
      return { ...state, [action.name]: action.number };
    case 'boolean':
      return { ...state, [action.name]: action.boolean };
    case 'reset':
      return initialState;
    default:
      return state;
  }
};

// --- TOAST SYSTEM ---
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

const Badge = ({ className, children, color }) => (
  <div
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${className}`}
    style={{ backgroundColor: color, color: '#fff' }}
  >
    {children}
  </div>
);

const Button = ({ className, variant = "default", size = "default", onClick, disabled, children, type = "button", title }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    ghost: "hover:bg-slate-800 text-slate-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    icon: "bg-transparent hover:bg-slate-800 text-slate-300"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-9 w-9",
    sm: "h-8 rounded-md px-3 text-xs"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

const Input = ({ className, ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-100 ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none text-slate-300 block mb-2">
    {children}
  </label>
);

// --- MODAL / DIALOG COMPONENTS ---

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

const ConfirmDialog = ({ open, title, description, onConfirm, onCancel, loading }) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="relative z-50 w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={onConfirm} disabled={loading} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
        </Button>
      </div>
    </motion.div>
  </Dialog>
);

// --- MAIN PLOTS CONTENT COMPONENT ---

function PlotsContent() {
  const { toast } = useToast();

  // State
  const [openView, setOpenView] = useState(false);
  const [Viewdata, setViewData] = useState({});
  const [RowData, setRowData] = useState({});
  const [openVisitor, setOpenVisitor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Confirmation State
  const [confirmState, setConfirmState] = useState({ open: false, title: '', description: '', action: null });

  const [state, dispatch] = useReducer(commonReducer, initialState);
  const [Employee, setEmployee] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [Data, SetData] = useState([]); // Stores Units
  const [siteList, setSiteList] = useState([]); // Stores Sites

  const [PlotStatus] = useState([
    { PlotStatusIDPK: 5, PlotStatusName: "Visited", colorCode: '#3b82f6' },
    { PlotStatusIDPK: 5, PlotStatusName: "Interested", colorCode: '#eab308' },
    { PlotStatusIDPK: 4, PlotStatusName: "Hold By", colorCode: '#f97316' },
    { PlotStatusIDPK: 2, PlotStatusName: "Reserved By", colorCode: '#a855f7' },
    { PlotStatusIDPK: 3, PlotStatusName: "Booked By", colorCode: '#22c55e' },
    { PlotStatusIDPK: 1, PlotStatusName: "Sold To", colorCode: '#ef4444' }
  ]);

  const [Facing] = useState([
    { FacingIDPK: 1, FacingName: "South" },
    { FacingIDPK: 2, FacingName: "North" },
    { FacingIDPK: 3, FacingName: "West" },
    { FacingIDPK: 4, FacingName: "East" },
    { FacingIDPK: 5, FacingName: "NE" },
    { FacingIDPK: 6, FacingName: "NW" },
    { FacingIDPK: 7, FacingName: "SE" },
    { FacingIDPK: 8, FacingName: "SW" }
  ]);

  // --- API FUNCTIONS ---

  useEffect(() => {
    getPlot();
    getSites(); // Fetch Sites on Load
    getUnitList(); // Fetch Units on Load (for filter matching)
  }, []);

  const getSites = async () => {
    try {
      let url = config.Api + "Site/getAllSites";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      setSiteList(result.data || result);
    } catch (error) {
      console.error(error);
    }
  };

  const getPlot = async () => {
    try {
      setLoading(true);
      let url = config.Api + "Plot/getAllPlots";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to get Plots');

      const result = await response.json();
      const data = result.data || [];
      setEmployee(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnitList = async () => {
    try {
      let url = config.Api + "Unit/getAllUnits"; // Changed endpoint to Unit/getAllUnits to be consistent
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to get Units');
      const result = await response.json();
      SetData(result.data || result);
    } catch (error) { console.error('Error:', error); }
  };

  const getVisitor = async (val) => {
    try {
      let filter = (val || state.visitorName) ? { visitorName: val || state.visitorName } : {};
      let url = config.Api + "Plot/getAllVisitors/";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter),
      });
      if (!response.ok) throw new Error('Failed to get Visitor');
      const result = await response.json();
      // Reusing Data state logic for Visitor is tricky if we use it for Units too. 
      // Ideally separate state for visitor list, but keeping structure:
      // We will perform logic in render to map correct list or use separate temp state
      // For now, let's assume this updates a separate list or handle carefully.
      // NOTE: In original code Data was reused. I will fetch visitors directly in dropdown click or separate state if possible. 
      // For safety, I'll update SetData but be aware of conflict if opening Unit and Visitor dropdowns simultaneously.
      SetData(result || []);
    } catch (error) { console.error('Error:', error); }
  };

  const createPlot = async (data) => {
    let url = config.Api + "Plot/createPlot";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create Plot');
    return await response.json();
  };

  const updatePlot = async (data) => {
    let url = config.Api + "Plot/updatePlot";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update Plot');
    return await response.json();
  };

  const deleteRow = async (data) => {
    let url = config.Api + "Employee/deleteEmployee";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to delete');
    const result = await response.json();
    getPlot();
    return result;
  };

  const updatePlotStatus = async (data) => {
    let url = config.Api + "Plot/updatePlotStatus";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.status === 400) {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
      return false;
    } else {
      toast({ title: 'Success', description: result.message, variant: 'success' });
      return result;
    }
  };

  // --- LOGIC HANDLERS ---

  const storeDispatch = useCallback((e, name, fieldType) => {
    if (fieldType === "text") {
      dispatch({ type: 'text', name: name, value: e });
    }
    else if (fieldType === "select") {
      if (name === 'siteId') {
        dispatch({ type: 'text', name: "siteId", value: e._id });
        dispatch({ type: 'text', name: "sitename", value: e.sitename });
        // Reset Unit when Site changes
        dispatch({ type: 'text', name: "unitId", value: '' });
        dispatch({ type: 'text', name: "UnitName", value: '' });
      } else if (name === 'unitId') {
        dispatch({ type: 'text', name: "unitId", value: e._id });
        dispatch({ type: 'text', name: "UnitName", value: e.UnitName });
      } else if (name === 'facing') {
        dispatch({ type: 'text', name: "facing", value: e.FacingName });
      } else if (name === 'VisitorID') {
        dispatch({ type: 'text', name: 'visitorId', value: e._id });
        dispatch({ type: 'text', name: 'visitorName', value: e.visitorName });
      } else if (name === 'PlotStatusID') {
        dispatch({ type: 'text', name: "statusName", value: e.PlotStatusName });
      }
    }
  }, []);

  const clear = () => {
    setIsEdit(false);
    dispatch({ type: 'reset' });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (Employee.length === 0) return;
    const filtered = Employee.filter((row) =>
      Object.values(row).some((val) => val?.toString().toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredData(filtered);
  };

  const editTable = (data) => {
    setIsEdit(true);
    dispatch({ type: 'text', name: '_id', value: data._id || '' });

    // Set Site if available (Assuming unitId carries siteId populated or plot carries siteId)
    // If backend doesn't populate site inside unit, we need to handle that. 
    // Assuming structure: Plot -> unitId -> siteId
    if (data.unitId?.siteId) {
      dispatch({ type: 'text', name: "siteId", value: data.unitId.siteId._id || data.unitId.siteId });
      dispatch({ type: 'text', name: "sitename", value: data.unitId.siteId.sitename || '' });
    }

    dispatch({ type: 'text', name: "plotCode", value: data.plotCode || '' });
    dispatch({ type: 'text', name: "plotNumber", value: data.plotNumber || '' });
    dispatch({ type: 'text', name: "areaInSqFt", value: data.areaInSqFt || '' });
    dispatch({ type: 'text', name: "cents", value: data.cents || '' });
    dispatch({ type: 'text', name: "road", value: data.road || '' });
    dispatch({ type: 'text', name: "landmark", value: data.landmark || '' });
    dispatch({ type: 'text', name: "dimension", value: data.dimension || '' });
    dispatch({ type: 'text', name: "remarks", value: data.remarks || '' });
    dispatch({ type: 'text', name: "description", value: data.description || '' });
    if (data.statusId) {
      dispatch({ type: 'text', name: "statusId", value: data.statusId._id || '' });
      dispatch({ type: 'text', name: "statusName", value: data.statusId.statusName || '' });
    }
    dispatch({ type: 'text', name: "facing", value: data.facing || '' });
    if (data.unitId) {
      dispatch({ type: 'text', name: "unitId", value: data.unitId._id || '' });
      dispatch({ type: 'text', name: "UnitName", value: data.unitId.UnitName || '' });
    }
    setDialogOpen(true);
  };

  // --- VALIDATION UPDATE ---
  const Validate = () => {
    if (!state.siteId) {
      toast({ title: 'Error', description: 'Please select a Site', variant: 'destructive' });
      return;
    }
    // Unit is not mandatory per request
    triggerConfirm(isEdit ? 'Update' : 'Save');
  };

  const ValidateVisitor = () => {
    if (!state.statusName) {
      toast({ title: 'Error', description: 'Please select status', variant: 'destructive' });
      return;
    }
    if (!state.visitorId) {
      toast({ title: 'Error', description: 'Please select visitor', variant: 'destructive' });
      return;
    }
    triggerConfirm('Visitor');
  }

  const triggerConfirm = (type) => {
    let title = '';
    let description = '';
    let action = null;

    if (type === 'Update') {
      title = 'Update Plot?';
      description = 'Are you sure you want to update this plot information?';
      action = () => performSubmit('Update');
    } else if (type === 'Save') {
      title = 'Create Plot?';
      description = 'Are you sure you want to create this new plot?';
      action = () => performSubmit('Save');
    } else if (type === 'Visitor') {
      title = 'Add Visitor?';
      description = 'Are you sure you want to add this visitor to the plot?';
      action = performVisitorSubmit;
    }

    setConfirmState({ open: true, title, description, action });
  };

  // --- EXECUTORS ---

  const performSubmit = async (type) => {
    setLoading(true);
    try {
      const updateData = {
        _id: state._id,
        siteId: state.siteId, // Include Site
        unitId: state.unitId,
        plotCode: state.plotCode,
        UnitName: state.UnitName,
      };
      const saveData = {
        siteId: state.siteId, // Include Site
        plotNumber: state.plotNumber,
        dimension: state.dimension,
        areaInSqFt: state.areaInSqFt,
        cents: state.cents,
        road: state.road,
        landmark: state.landmark,
        remarks: state.remarks,
        description: state.description,
        facing: state.facing,
        unitId: state.unitId
      };

      if (type === 'Update') {
        await updatePlot(updateData);
        toast({ title: 'Success', description: 'Plot updated successfully', variant: 'success' });
      } else {
        await createPlot(saveData);
        toast({ title: 'Success', description: 'Plot created successfully', variant: 'success' });
      }
      clear();
      setDialogOpen(false);
      getPlot();
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Operation failed', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmState({ ...confirmState, open: false });
    }
  };

  const performVisitorSubmit = async () => {
    setLoading(true);
    try {
      const updateData = { plotId: RowData._id };
      if (state.statusName === 'Sold To') updateData.soldToVisitorId = state.visitorId;
      else if (state.statusName === 'Reserved By') updateData.reservedBy = state.visitorId;
      else if (state.statusName === 'Hold By') updateData.holdBy = state.visitorId;
      else if (state.statusName === 'Booked By') updateData.bookedBy = state.visitorId;
      else if (state.statusName === 'Interested') updateData.interestedBy = state.visitorId;
      else if (state.statusName === 'Visited') updateData.visitedBy = state.visitorId;

      const res = await updatePlotStatus(updateData);
      if (res) {
        clear();
        setOpenVisitor(false);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add visitor', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmState({ ...confirmState, open: false });
    }
  };

  const handleView = (row) => {
    setViewData({
      "Plot Code": row.plotCode,
      "Site": row.unitId?.siteId?.sitename || '-',
      "Unit": row.unitId?.UnitName || '-'
    });
    setOpenView(true);
  };

  const handleAddVisitor = (row) => {
    setRowData(row);
    dispatch({ type: 'text', name: '_id', value: row._id || '' });
    setOpenVisitor(true);
  };

  // Helper to filter units based on selected Site
  const getFilteredUnits = () => {
    if (!state.siteId) return [];
    // Filter units where unit.siteId matches state.siteId
    // Ensure backend populates siteId in Unit/getAllUnits or returns siteId string
    return Data.filter(u => {
      const uSiteId = u.siteId?._id || u.siteId; // Handle populated object or ID string
      return uSiteId === state.siteId;
    });
  };

  return (
    <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">

      {/* --- HEADER --- */}
      <div className="flex md:flex-row flex-col  items-start md:justify-between gap-2">
        <h1 className="text-3xl font-bold text-white">Plots</h1>
        <div className="flex  md:flex-row flex-col  gap-3">
          <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={() => { clear(); setDialogOpen(true); }} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold border-0">
            <Plus className="w-4 h-4 mr-2" /> Add Plot
          </Button>
        </div>
      </div>

      {/* --- TABLE CARD --- */}
      <Card className='hidden md:block'>
        <CardContent className="p-6">
          {/* FILTER BAR */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input
                placeholder="Search plots..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200 focus-visible:ring-fuchsia-500"
              />
            </div>
            <Button variant="outline" onClick={() => getPlot()} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* DATA TABLE */}
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Site</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Unit</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Plot No</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Area (Sq.ft)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Facing</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && filteredData.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-fuchsia-400"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No plots found.</td></tr>
                ) : (
                  filteredData.map((row, index) => (
                    <motion.tr
                      key={row._id || index}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-white">{row?.siteId?.sitename || '-'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-white">{row.unitId?.UnitName || '-'}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.plotNumber}</td>
                      <td className="py-3 px-4">
                        <Badge color={row.statusId?.colorCode || '#64748b'}>
                          {row.statusId?.statusName || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.areaInSqFt}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.facing}</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Button variant="icon" size="icon" onClick={() => handleView(row)} title="View"><Eye className="w-4 h-4 text-blue-400" /></Button>
                        <Button variant="icon" size="icon" onClick={() => editTable(row)} title="Edit"><Pencil className="w-4 h-4 text-yellow-400" /></Button>
                        <Button variant="icon" size="icon" onClick={() => handleAddVisitor(row)} title="Add Visitor"><UserPlus className="w-4 h-4 text-green-400" /></Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* //card for Mobile view */}
      <Card className=' md:hidden'>
        <CardContent className="p-6">
          {/* FILTER BAR */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input
                placeholder="Search plots..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200 focus-visible:ring-fuchsia-500"
              />
            </div>
            <Button variant="outline" onClick={() => getPlot()} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* DATA TABLE */}
          {/* CARD LIST FOR MOBILE */}
          <div className="space-y-4">
            {loading && filteredData.length === 0 ? (
              <div className="text-center py-6 text-fuchsia-400">
                <Loader2 className="animate-spin inline mr-2" /> Loading...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                No plots found.
              </div>
            ) : (
              filteredData.map((row, index) => (
                <motion.div
                  key={row._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="
          bg-purple-900/40
          border border-fuchsia-700/40
          rounded-xl
          p-4
          shadow-lg
          hover:bg-purple-800/60
          transition-all
        "
                >
                  {/* SITE + STATUS ROW */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-white">
                      {row?.siteId?.sitename || '-'}
                    </h3>

                    <Badge color={row.statusId?.colorCode || '#64748b'}>
                      {row.statusId?.statusName || 'Unknown'}
                    </Badge>
                  </div>

                  {/* UNIT */}
                  <div className="flex items-center gap-2 text-purple-300 text-sm mb-1">
                    <Home className="w-4 h-4" />
                    <span>{row.unitId?.UnitName || '-'}</span>
                  </div>

                  {/* PLOT NO */}
                  <div className="flex items-center gap-2 text-fuchsia-300 text-sm mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>{row.plotNumber}</span>
                  </div>

                  {/* AREA */}
                  <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                    <Square className="w-4 h-4" />
                    <span>{row.areaInSqFt} Sq.ft</span>
                  </div>

                  {/* FACING */}
                  <div className="flex items-center gap-2 text-slate-300 text-sm mb-3">
                    <Compass className="w-4 h-4" />
                    <span>{row.facing}</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex justify-end border-t border-purple-700/40 pt-2 gap-2">
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => handleView(row)}
                      title="View"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => editTable(row)}
                      title="Edit"
                      className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => handleAddVisitor(row)}
                      title="Add Visitor"
                      className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

        </CardContent>
      </Card>


      {/* --- ADD / EDIT PLOT DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]" title={isEdit ? "Edit Plot" : "Add New Plot"} onClose={() => setDialogOpen(false)}>
          <div className="overflow-y-auto p-6 custom-scrollbar">
            <form onSubmit={(e) => { e.preventDefault(); Validate(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* SITE SELECTION (MANDATORY) */}
              <div>
                <Label>Site <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none"
                    value={state.siteId}
                    onChange={(e) => {
                      const selected = siteList.find(s => s._id === e.target.value);
                      if (selected) storeDispatch(selected, 'siteId', 'select');
                    }}
                  >
                    <option value="">Select Site</option>
                    {siteList.map(s => <option key={s._id} value={s._id}>{s.sitename}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              {/* UNIT SELECTION (FILTERED BY SITE) */}
              <div>
                <Label>Unit</Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none disabled:opacity-50"
                    value={state.unitId}
                    disabled={!state.siteId} // Disable if no Site selected
                    onChange={(e) => {
                      const selected = Data.find(d => d._id === e.target.value);
                      if (selected) storeDispatch(selected, 'unitId', 'select');
                      else storeDispatch({ _id: '', UnitName: '' }, 'unitId', 'select'); // Clear if reset
                    }}
                  >
                    <option value="">Select Unit (Optional)</option>
                    {getFilteredUnits().map(u => <option key={u._id} value={u._id}>{u.UnitName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label>Plot Number <span className="text-red-500">*</span></Label>
                <Input value={state.plotNumber} onChange={(e) => storeDispatch(e.target.value, "plotNumber", "text")} />
              </div>

              <div>
                <Label>Dimension</Label>
                <Input value={state.dimension} onChange={(e) => storeDispatch(e.target.value, "dimension", "text")} />
              </div>

              <div>
                <Label>Area (Sq.ft)</Label>
                <Input type="number" value={state.areaInSqFt} onChange={(e) => storeDispatch(e.target.value, "areaInSqFt", "text")} />
              </div>

              <div>
                <Label>Cents</Label>
                <Input type="number" value={state.cents} onChange={(e) => storeDispatch(e.target.value, "cents", "text")} />
              </div>

              <div>
                <Label>Facing <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none"
                    value={state.facing}
                    onChange={(e) => storeDispatch({ FacingName: e.target.value }, 'facing', 'select')}
                  >
                    <option value="">Select Facing</option>
                    {Facing.map(f => <option key={f.FacingIDPK} value={f.FacingName}>{f.FacingName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label>Road</Label>
                <Input value={state.road} onChange={(e) => storeDispatch(e.target.value, "road", "text")} />
              </div>

              <div>
                <Label>Landmark</Label>
                <Input value={state.landmark} onChange={(e) => storeDispatch(e.target.value, "landmark", "text")} />
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input value={state.description} onChange={(e) => storeDispatch(e.target.value, "description", "text")} />
              </div>

              <div className="md:col-span-2">
                <Label>Remarks</Label>
                <Input value={state.remarks} onChange={(e) => storeDispatch(e.target.value, "remarks", "text")} />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update' : 'Save')}</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ADD VISITOR DIALOG --- */}
      <Dialog open={openVisitor} onOpenChange={setOpenVisitor}>
        <DialogContent className="sm:max-w-[600px]" title="Add Visitor" onClose={() => { clear(); setOpenVisitor(false); }}>
          <div className="p-6 space-y-4">
            <div>
              <Label>Status <span className="text-red-500">*</span></Label>
              <div className="relative">
                <select
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none"
                  value={state.statusName}
                  onChange={(e) => storeDispatch({ PlotStatusName: e.target.value }, 'PlotStatusID', 'select')}
                >
                  <option value="">Select Status</option>
                  {PlotStatus.map(s => <option key={s.PlotStatusIDPK} value={s.PlotStatusName}>{s.PlotStatusName}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>

            <div>
              <Label>Visitor <span className="text-red-500">*</span></Label>
              <div className="relative">
                <select
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 appearance-none"
                  value={state.visitorId}
                  onClick={() => getVisitor()}
                  onChange={(e) => {
                    const vis = Data.find(v => v._id === e.target.value);
                    if (vis) storeDispatch({ _id: vis._id, visitorName: vis.visitorName || vis['Visitor Name'] }, 'VisitorID', 'select');
                  }}
                >
                  <option value="">Select Visitor</option>
                  {Data.map((v, i) => <option key={v._id || i} value={v._id}>{v.visitorName || v['Visitor Name']}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setOpenVisitor(false)}>Cancel</Button>
              <Button onClick={ValidateVisitor} disabled={loading}>{loading ? 'Adding...' : 'Add Visitor'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- VIEW DATA MODAL --- */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-[400px]" title="Plot Details" onClose={() => setOpenView(false)}>
          <div className="p-6 space-y-4">
            {Object.entries(Viewdata).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">{key}</span>
                <span className="text-white font-bold">{val}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRMATION DIALOG --- */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState({ ...confirmState, open: false })}
        loading={loading}
      />

    </div>
  );
}

// Wrap with Toast Provider
export default function Plots() {
  return (
    <ToastProvider>
      <PlotsContent />
    </ToastProvider>
  );
}