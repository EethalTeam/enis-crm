import React, { useState, useEffect, useReducer, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Download, Upload, Loader2, Eye, Pencil, Trash2,
  X, RefreshCw, AlertTriangle, ToggleLeft, ToggleRight, MapPin
} from 'lucide-react';

import { config } from '@/components/CustomComponents/config.js';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";

// --- LOCAL REDUCER ---
const initialState = {
  _id: '',
  siteId: '', // Stores the ID for the database
  sitename: '', // Stores the name for UI display
  UnitName: '',
  UnitCode: ''
};

const commonReducer = (state, action) => {
  switch (action.type) {
    case 'text':
      return { ...state, [action.name]: action.value };
    case 'boolean':
      return { ...state, [action.name]: action.value };
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

// --- UI COMPONENTS ---

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

const Button = ({ className, variant = "default", size = "default", onClick, disabled, children, type = "button", title }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    ghost: "hover:bg-slate-800 text-slate-100",
    destructive: "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50",
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

// --- GLASS SELECT (ADDED FOR SITE SELECTION) ---
const GlassSelect = ({ label, value, onChange, options = [], placeholder, disabled, displayKey, valueKey, onFocus }) => (
  <div className="space-y-2">
    {label && <Label>{label} {label && <span className="text-red-500">*</span>}</Label>}
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onFocus={onFocus}
        onChange={(e) => {
          const selectedObj = options.find(item => String(item[valueKey]) === e.target.value || String(item[displayKey]) === e.target.value);
          onChange(selectedObj);
        }}
        className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 appearance-none"
      >
        <option value="" className="bg-slate-900 text-gray-400">{placeholder || "Select..."}</option>
        {options.map((item, idx) => (
          <option key={idx} value={item[valueKey] || item[displayKey]} className="bg-slate-900 text-slate-100">
            {item[displayKey]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
      </div>
    </div>
  </div>
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
    <div className="p-1">{children}</div>
  </motion.div>
);

// --- CONFIRMATION DIALOG ---

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

// --- MAIN CONTENT COMPONENT ---

function UnitsContent() {
  const { toast } = useToast();

  // --- STATES ---
  const [unitList, setUnitList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // New: Site List State
  const [siteList, setSiteList] = useState([]);

  // Confirmation State
  const [confirmState, setConfirmState] = useState({ open: false, title: '', description: '', action: null });

  // Form & Data State
  const [state, dispatch] = useReducer(commonReducer, initialState);
  const [isEdit, setIsEdit] = useState(false);
  const [viewData, setViewData] = useState({});
  const { getPermissionsByPath, user } = useAuth();
  const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false });


  // --- API FUNCTIONS ---

  useEffect(() => {
    // getUnit();
    getSites(); // Fetch sites on load
  }, []);


  // --- API FUNCTIONS ---
  useEffect(() => {
    getPermissionsByPath(window.location.pathname).then(res => {
      if (res) {
        setPermissions(res)
      } else {
        navigate('/dashboard')
      }
    })

  }, [])

  useEffect(() => {
    if (Permissions.isView) {
      getUnit()
    }
  }, [Permissions])



  const getSites = async () => {
    try {
      // Endpoint as requested
      let url = config.Api + "Site/getAllSites";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      // Handle response structure depending on your API
      const data = result.data || result;
      setSiteList(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to fetch Sites', variant: 'destructive' });
    }
  };

  const getUnit = async () => {
    try {
      setLoading(true);
      let url = config.Api + "Unit/getAllUnits";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to get Units');
      const result = await response.json();

      const data = result.data || result;
      setUnitList(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to fetch units', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createUnit = async (data) => {
    let url = config.Api + "Unit/createUnit";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create Unit');
    return await response.json();
  };

  const updateUnit = async (data) => {
    let url = config.Api + "Unit/updateUnit";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update Unit');
    return await response.json();
  };

  const deleteRow = async (data) => {
    let url = config.Api + "Unit/deleteUnit";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to delete Unit');
    const result = await response.json();
    getUnit();
    return result;
  };

  // --- HANDLERS ---

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (unitList.length === 0) return;
    const filtered = unitList.filter((row) =>
      Object.values(row).some((val) => val?.toString().toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredData(filtered);
  };

  const storeDispatch = (e, name, fieldType) => {
    if (fieldType === "text") {
      dispatch({ type: 'text', name, value: e });
    }
    else if (fieldType === "boolean") {
      dispatch({ type: 'boolean', name, value: e });
    }
    else if (fieldType === "select") {
      if (name === "siteId") {
        // Save ID for backend
        dispatch({ type: 'text', name: 'siteId', value: e._id });
        // Save Name for display
        dispatch({ type: 'text', name: 'sitename', value: e.sitename });
      }
    }
  };

  const clear = () => {
    setIsEdit(false);
    dispatch({ type: 'reset' });
  };

  const handleEditClick = (row) => {
    setIsEdit(true);
    dispatch({ type: 'text', name: '_id', value: row._id || '' });
    // Populate Site
    if (row.siteId) {
      dispatch({ type: 'text', name: "siteId", value: row.siteId._id || row.siteId });
      dispatch({ type: 'text', name: "sitename", value: row.siteId.sitename || '' });
    }
    dispatch({ type: 'text', name: "UnitName", value: row.UnitName || '' });
    dispatch({ type: 'text', name: "UnitCode", value: row.UnitCode || '' });
    setDialogOpen(true);
  };

  const handleViewClick = (row) => {
    setViewData({
      "Site": row.siteId?.sitename || '-',
      "Unit Name": row.UnitName,
      "Unit Code": row.UnitCode
    });
    setViewOpen(true);
  };

  // --- VALIDATION & SUBMIT ---

  const Validate = () => {
    if (!state.siteId) {
      toast({ title: 'Error', description: 'Please select a Site', variant: 'destructive' });
      return;
    }
    if (!state.UnitName) {
      toast({ title: 'Error', description: 'Please enter Unit Name', variant: 'destructive' });
      return;
    }
    if (!state.UnitCode) {
      toast({ title: 'Error', description: 'Please enter Unit Code', variant: 'destructive' });
      return;
    }
    triggerConfirm(isEdit ? 'Update' : 'Save');
  };

  const triggerConfirm = (type) => {
    let title = '';
    let description = '';
    let action = null;

    if (type === 'Update') {
      title = 'Update Unit?';
      description = 'Are you sure you want to update this unit?';
      action = handleSubmit;
    } else if (type === 'Save') {
      title = 'Create Unit?';
      description = 'Are you sure you want to create this new unit?';
      action = handleSubmit;
    } else if (type === 'Delete') {
      title = 'Delete Unit?';
      description = 'This action cannot be undone.';
    }

    setConfirmState({ open: true, title, description, action });
  };

  const triggerDeleteConfirm = (row) => {
    setConfirmState({
      open: true,
      title: 'Delete Unit?',
      description: 'Are you sure you want to delete this unit?',
      action: () => handleDelete(row)
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updateData = {
        _id: state._id,
        siteId: state.siteId,
        UnitName: state.UnitName,
        UnitCode: state.UnitCode
      };

      const saveData = {
        siteId: state.siteId,
        UnitName: state.UnitName,
        UnitCode: state.UnitCode
      };

      if (isEdit) {
        await updateUnit(updateData);
        toast({ title: 'Success', description: 'Unit updated successfully', variant: 'success' });
      } else {
        await createUnit(saveData);
        toast({ title: 'Success', description: 'Unit created successfully', variant: 'success' });
      }
      clear();
      setDialogOpen(false);
      getUnit();
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Operation failed', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmState({ ...confirmState, open: false });
    }
  };

  const handleDelete = async (row) => {
    setLoading(true);
    try {
      await deleteRow(row); // Assuming row contains _id
      toast({ title: 'Success', description: 'Unit deleted successfully', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete unit', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmState({ ...confirmState, open: false });
    }
  };

  const handleImport = () => {
    toast({ title: 'Import', description: 'Feature not implemented in this demo.' });
  };

  const handleExport = () => {
    toast({ title: 'Export', description: 'Feature not implemented in this demo.' });
  };

  return (
    <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">

      {/* HEADER */}
   <div className="flex flex-col md:flex-row items-start space-y-3 md:items-center md:justify-between">
  
  {/* ===== PAGE TITLE ===== */}
  <h1 className="text-2xl md:text-3xl font-bold text-white">
    Units
  </h1>

  {/* ===== ACTION BUTTON ===== */}
  {Permissions.isAdd && (
    <Button
      onClick={() => {
        clear();
        setDialogOpen(true);
      }}
      className="
         md:w-auto
        flex items-center justify-center
        bg-gradient-to-r from-fuchsia-600 to-pink-600
        text-white
        font-semibold
        shadow-md
        hover:opacity-90
      "
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Unit
    </Button>
  )}
</div>



      {/* TABLE CARD */}
      <Card>
        <CardContent className="p-6">
          {/* FILTER BAR */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200 focus-visible:ring-fuchsia-500"
              />
            </div>
            <Button variant="outline" onClick={() => getUnit()} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* DATA TABLE */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Site Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Unit Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Unit Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && filteredData.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-fuchsia-400"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400">No units found.</td></tr>
                ) : (
                  filteredData.map((row, index) => (
                    <motion.tr
                      key={row._id || index}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* SITE NAME COLUMN */}
                      <td className="py-3 px-4 text-sm font-medium text-white">{row.siteId?.sitename || '-'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-white">{row.UnitName}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.UnitCode}</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Button variant="icon" size="icon" onClick={() => handleViewClick(row)} title="View"><Eye className="w-4 h-4 text-blue-400" /></Button>
                        {
                          Permissions.isEdit &&
                          <Button variant="icon" size="icon" onClick={() => handleEditClick(row)} title="Edit"><Pencil className="w-4 h-4 text-yellow-400" /></Button>

                        }
                        {
                          Permissions.isDelete &&
                          <Button variant="icon" size="icon" onClick={() => triggerDeleteConfirm(row)} title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></Button>

                        }
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARD VIEW ================= */}
        <div className="space-y-6 md:hidden">
  {loading && filteredData.length === 0 ? (
    <div className="text-center py-8 text-fuchsia-400">
      <Loader2 className="animate-spin inline mr-2" />
      Loading...
    </div>
  ) : filteredData.length === 0 ? (
    <div className="text-center py-8 text-slate-400">
      No units found.
    </div>
  ) : (
    filteredData.map((row, index) => (
      <motion.div
        key={row._id || index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="
          rounded-xl
          border border-slate-700
          
          p-4
          shadow-md
        "
      >
        {/* ===== TOP ROW ===== */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              City
            </div>

            <div className="text-base font-semibold text-white">
              {row.cityName || row.UnitName}
            </div>

            <div className="text-sm text-slate-400">
              {row.stateId?.stateName || row.siteId?.sitename || "-"}
            </div>
          </div>

          {/* ID BADGE */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-600/20 text-fuchsia-400">
            {row.cityCode || row.UnitCode}
          </span>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => handleViewClick(row)}
            title="View"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye className="w-4 h-4" />
          </button>

          {Permissions.isEdit && (
            <button
              onClick={() => handleEditClick(row)}
              title="Edit"
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {Permissions.isDelete && (
            <button
              onClick={() => triggerDeleteConfirm(row)}
              title="Delete"
              className="text-red-400 hover:text-red-300 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    ))
  )}
</div>


        </CardContent>
      </Card>

      {/* --- ADD/EDIT DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" title={isEdit ? "Edit Unit" : "Add New Unit"} onClose={() => setDialogOpen(false)}>
          <div className="p-6 space-y-4">

            {/* SITE SELECTION */}
            <div className="space-y-2">
              <GlassSelect
                label="Site"
                value={state.siteId}
                displayKey="sitename"
                valueKey="_id"
                options={siteList}
                onChange={(e) => storeDispatch(e, 'siteId', 'select')}
                placeholder="Select Site"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Unit Code <span className="text-red-500">*</span></Label>
                <Input value={state.UnitCode} onChange={(e) => storeDispatch(e.target.value, "UnitCode", "text")} />
              </div>
              <div>
                <Label>Unit Name <span className="text-red-500">*</span></Label>
                <Input value={state.UnitName} onChange={(e) => storeDispatch(e.target.value, "UnitName", "text")} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={Validate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isEdit ? 'Update' : 'Save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- VIEW DIALOG --- */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[400px]" title="Unit Details" onClose={() => setViewOpen(false)}>
          <div className="p-6 space-y-3">
            {Object.entries(viewData).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                <span className="text-slate-400 font-medium text-sm">{key}</span>
                <span className="text-white font-bold text-sm text-right">{val}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM DIALOG --- */}
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

export default function Units() {
  return (
    <ToastProvider>
      <UnitsContent />
    </ToastProvider>
  );
}