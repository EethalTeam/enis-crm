import React, { useState, useEffect, useReducer, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Download, Upload, Loader2, Eye, Pencil, Trash2, 
  X, RefreshCw, AlertTriangle, MapPin, Building 
} from 'lucide-react';

import { config } from '@/components/CustomComponents/config.js';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";

// --- LOCAL REDUCER ---
const initialState = {
  _id: '',
  sitename: '',
  location: '',
  // City & State fields matching Visitor Form logic
  cityId: '', // Value to send to DB
  CityName: '', // Label for UI
  StateID: '', // Value to send to DB
  StateName: '', // Label for UI
  
  totalArea: '',
  zipcode: '',
  address: '',
  siteType: '',
  subType: '',
  description: ''
};

const commonReducer = (state, action) => {
  switch (action.type) {
    case 'text':
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
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };
  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
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
                t.variant === 'destructive' ? 'bg-red-900/90 border-red-800 text-white' : 
                t.variant === 'success' ? 'bg-green-900/90 border-green-800 text-white' : 
                'bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-sm'
              }`}
            >
              <div>{t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}{t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}</div>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => useContext(ToastContext);

// --- UI COMPONENTS ---
const Card = ({ className, children }) => <div className={`rounded-lg border bg-slate-900 border-slate-800 shadow-sm ${className}`}>{children}</div>;
const CardContent = ({ className, children }) => <div className={className}>{children}</div>;

const Button = ({ className, variant = "default", size = "default", onClick, disabled, children }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    ghost: "hover:bg-slate-800 text-slate-100",
    destructive: "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50",
    icon: "bg-transparent hover:bg-slate-800 text-slate-300"
  };
  const sizes = { default: "h-10 px-4 py-2", icon: "h-9 w-9", sm: "h-8 rounded-md px-3 text-xs" };
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Input = ({ className, ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 ${className}`} {...props} />
);

const Textarea = ({ className, ...props }) => (
    <textarea className={`flex min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 ${className}`} {...props} />
);

const Label = ({ children }) => <label className="text-sm font-medium leading-none text-slate-300 block mb-2">{children}</label>;

// --- GLASS SELECT (From Reference) ---
const GlassSelect = ({ label, value, onChange, options = [], placeholder, disabled, displayKey, valueKey, onFocus }) => (
    <div className="space-y-2">
      {label && <Label>{label} {label && <span className="text-red-500">*</span>}</Label>}
      <div className="relative">
        <select
            value={value} // This controls the currently selected Label/ID based on logic
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
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
);

// --- MODALS ---
const Dialog = ({ open, onOpenChange, children }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onOpenChange(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        {children}
      </div>
    )}
  </AnimatePresence>
);

const DialogContent = ({ className, children, title, onClose }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`relative z-50 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-lg flex flex-col max-h-[90vh] ${className}`}>
    <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
    </div>
    <div className="overflow-y-auto p-6">{children}</div>
  </motion.div>
);

const ConfirmDialog = ({ open, title, description, onConfirm, onCancel, loading }) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-50 w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0"><AlertTriangle className="w-6 h-6 text-yellow-500" /></div>
        <div><h3 className="text-lg font-bold text-white">{title}</h3><p className="text-sm text-slate-400 mt-1">{description}</p></div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={onConfirm} disabled={loading} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}</Button>
      </div>
    </motion.div>
  </Dialog>
);

// --- MAIN CONTENT ---

function SitesContent() {
  const { toast } = useToast();
  
  const [siteList, setSiteList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmState, setConfirmState] = useState({ open: false, title: '', description: '', action: null });
  
  // Dropdown Data Lists
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [state, dispatch] = useReducer(commonReducer, initialState);
  const [isEdit, setIsEdit] = useState(false);
  const [viewData, setViewData] = useState({});
   const { getPermissionsByPath } = useAuth();
    const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false })

  useEffect(() => {
    // getSites();
    // Pre-fetch states on load if needed, or do it on focus
    getStateList(); 
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
  
  useEffect(()=>{
      if (Permissions.isView) {
      getSites()
      }
  },[Permissions])

  const getSites = async () => {
    try {
      setLoading(true);
      let url = config.Api + "Site/getAllSites"; 
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (!response.ok) throw new Error('Failed to get Sites');
      const result = await response.json();
      const data = result.data || result; 
      setSiteList(data);
      setFilteredData(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not fetch properties', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // 1. Get States (From Visitor Reference)
  const getStateList = async () => {
    try {
      let url = config.Api + "State/getAllStates";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      setStateList(result);
    } catch (error) { console.error(error); }
  };

  // 2. Get Cities (From Visitor Reference)
  const getCityList = async () => {
    try {
      let url = config.Api + "City/getAllCitys";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ StateID: state.StateID }), // Uses StateID from reducer
      });
      const result = await response.json();
      setCityList(result);
    } catch (error) { console.error(error); }
  };

  const createSite = async (data) => {
    let url = config.Api + "Site/createSite";
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to create Site');
    return await response.json();
  };

  const updateSite = async (data) => {
    let url = config.Api + "Site/updateSite";
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to update Site');
    return await response.json();
  };

  const deleteRow = async (data) => {
    let url = config.Api + "Site/deleteSite";
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to delete Site');
    const result = await response.json();
    getSites();
    return result;
  };

  // --- HANDLERS ---

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (siteList.length === 0) return;
    const filtered = siteList.filter((row) => Object.values(row).some((val) => val && val.toString().toLowerCase().includes(value.toLowerCase())));
    setFilteredData(filtered);
  };

  // Updated StoreDispatch to handle Objects from Selects (Like Visitor Form)
  const storeDispatch = (e, name, fieldType) => {
    if (fieldType === "text") {
        dispatch({ type: 'text', name, value: e });
    } else if (fieldType === "select") {
        if (name === "StateID") {
            dispatch({ type: 'text', name: 'StateID', value: e.StateIDPK });
            dispatch({ type: 'text', name: "StateName", value: e.StateName });
            // Reset City when state changes
            dispatch({ type: 'text', name: "cityId", value: '' }); 
            dispatch({ type: 'text', name: "CityName", value: '' });
        }
        if (name === 'CityID') {
            dispatch({ type: 'text', name: "cityId", value: e.CityIDPK });
            dispatch({ type: 'text', name: "CityName", value: e.CityName });
        }
    }
  };

  const clear = () => {
    setIsEdit(false);
    dispatch({ type: 'reset' });
    setCityList([]); // Clear cities on reset
  };

  const handleEditClick = (row) => {
    setIsEdit(true);
    dispatch({ type: 'text', name: '_id', value: row._id || '' });
    dispatch({ type: 'text', name: "sitename", value: row.sitename || '' });
    dispatch({ type: 'text', name: "location", value: row.location || '' });
    
    // Handle population based on your backend structure
    if (row.city) {
        // Assuming populated object or flat ID
        dispatch({ type: 'text', name: "cityId", value: row.city._id || row.city }); 
        dispatch({ type: 'text', name: "CityName", value: row.city.CityName || row.city.name || '' });
    }
    if (row.state) {
        dispatch({ type: 'text', name: "StateID", value: row.state._id || row.state });
        dispatch({ type: 'text', name: "StateName", value: row.state.StateName || row.state.name || '' });
    }

    dispatch({ type: 'text', name: "totalArea", value: row.totalArea || '' });
    dispatch({ type: 'text', name: "zipcode", value: row.zipcode || '' });
    dispatch({ type: 'text', name: "address", value: row.address || '' });
    dispatch({ type: 'text', name: "siteType", value: row.siteType || '' });
    dispatch({ type: 'text', name: "subType", value: row.subType || '' });
    dispatch({ type: 'text', name: "description", value: row.description || '' });
    
    setDialogOpen(true);
    // Trigger city fetch if we have a state
    if(row.state) {
       // We might need to manually trigger the fetch here or let the effect handle it if we stored the ID correctly
       // For now, onFocus of the dropdown will handle it, but you could call getCityList() here manually
    }
  };

  const handleViewClick = (row) => {
    setViewData({
      "Site Name": row.sitename,
      "Location": row.location,
      "City": row.city?.CityName || row.city || '-',
      "State": row.state?.StateName || row.state || '-',
      "Type": row.propertyType,
      "Sub Type": row.subType,
      "Total Area": row.totalArea,
      "Zipcode": row.zipcode,
      "Address": row.address,
      "Description": row.description
    });
    setViewOpen(true);
  };

  // --- SUBMIT ---

  const Validate = () => {
    if (!state.sitename) { toast({ title: 'Error', description: 'Please enter Site Name', variant: 'destructive' }); return; }
    if (!state.location) { toast({ title: 'Error', description: 'Please enter Location', variant: 'destructive' }); return; }
    if (!state.StateID) { toast({ title: 'Error', description: 'Please select a State', variant: 'destructive' }); return; }
    triggerConfirm(isEdit ? 'Update' : 'Save');
  };

  const triggerConfirm = (type) => {
    setConfirmState({
      open: true,
      title: type === 'Update' ? 'Update Site?' : 'Create Site?',
      description: `Are you sure you want to ${type === 'Update' ? 'update' : 'create'} this site?`,
      action: handleSubmit
    });
  };

  const triggerDeleteConfirm = (row) => {
    setConfirmState({
      open: true,
      title: 'Delete Site?',
      description: 'Are you sure you want to delete this site?',
      action: () => handleDelete(row)
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Destructure state to map to API fields
      const { _id, cityId, StateID, ...rest } = state;
      
      // Map the local reducer keys (cityId, StateID) to the Schema keys (city, state)
      const payload = {
        ...rest,
        city: cityId,
        state: StateID,
        ...(isEdit && { _id }) 
      };

      if (isEdit) {
        await updateSite(payload);
        toast({ title: 'Success', description: 'Site updated successfully', variant: 'success' });
      } else {
        await createSite(payload);
        toast({ title: 'Success', description: 'Site created successfully', variant: 'success' });
      }
      clear();
      setDialogOpen(false);
      getSites();
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
      await deleteRow({ _id: row._id });
      toast({ title: 'Success', description: 'Site deleted successfully', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete site', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmState({ ...confirmState, open: false });
    }
  };

  return (
    <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Building className="text-fuchsia-600"/> Sites</h1>
        <div className="flex gap-3">
          {
            Permissions.isAdd && 
          <Button onClick={() => { clear(); setDialogOpen(true); }} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold border-0"><Plus className="w-4 h-4 mr-2" /> Add Site</Button>

          }
        </div>
      </div>

      {/* TABLE */}
      <Card className={`hidden md:block`}>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input placeholder="Search sites..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white" />
            </div>
            <Button variant="outline" onClick={() => getSites()} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Site Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">City</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">State</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && filteredData.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-fuchsia-400"><Loader2 className="animate-spin inline mr-2"/> Loading...</td></tr>
                ) : filteredData.length === 0 ? (
                   <tr><td colSpan="5" className="text-center py-8 text-slate-400">No sites found.</td></tr>
                ) : (
                  filteredData.map((row, index) => (
                    <motion.tr key={row._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-white">{row.sitename}</td>
                      <td className="py-3 px-4 text-sm text-slate-300 flex items-center gap-1"><MapPin className="w-3 h-3 text-fuchsia-500"/> {row.location}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.city?.CityName || row.city}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.state?.StateName || row.state}</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Button variant="icon" size="icon" onClick={() => handleViewClick(row)}><Eye className="w-4 h-4 text-blue-400" /></Button>
                        {
                          Permissions.isEdit && 
                        <Button variant="icon" size="icon" onClick={() => handleEditClick(row)}><Pencil className="w-4 h-4 text-yellow-400" /></Button>

                        }
                        {
                          Permissions.isDelete && 
                        <Button variant="icon" size="icon" onClick={() => triggerDeleteConfirm(row)}><Trash2 className="w-4 h-4 text-red-400" /></Button>

                        }
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      {/* mobile view Card */}
      <Card className={` md:hidden`}>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input placeholder="Search sites..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white" />
            </div>
            <Button variant="outline" onClick={() => getSites()} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
          </div>

          {/* MOBILE CARD VIEW */}
<div className="md:hidden space-y-4">
  {loading && filteredData.length === 0 ? (
    <div className="text-center py-8 text-fuchsia-400">
      <Loader2 className="animate-spin inline mr-2" /> Loading...
    </div>
  ) : filteredData.length === 0 ? (
    <div className="text-center py-8 text-slate-400">
      No sites found.
    </div>
  ) : (
    filteredData.map((row, index) => (
      <motion.div
        key={row._id || index}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className=" backdrop-blur-lg shadow-md">
          
          {/* TOP STRIP */}
          {/* <div className="h-1 w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500" /> */}

          <CardContent className="p-4 space-y-3">

            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-fuchsia-300 uppercase tracking-wide">
                  Site Name
                </p>
                <h3 className="text-lg font-semibold text-white">
                  {row.sitename}
                </h3>
              </div>
            </div>

            {/* DETAILS */}
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-fuchsia-400" />
                <span>{row.location}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400">City</span>
                <p className="text-white font-medium">
                  {row.city?.CityName || row.city}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400">State</span>
                <p className="text-white font-medium">
                  {row.state?.StateName || row.state}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-start gap-2 pt-3 border-t border-slate-700/50">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-blue-500/20"
                onClick={() => handleViewClick(row)}
              >
                <Eye className="w-4 h-4 text-blue-400" />
              </Button>

              {Permissions.isEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-yellow-500/20"
                  onClick={() => handleEditClick(row)}
                >
                  <Pencil className="w-4 h-4 text-yellow-400" />
                </Button>
              )}

              {Permissions.isDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-500/20"
                  onClick={() => triggerDeleteConfirm(row)}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      </motion.div>
    ))
  )}
</div>

          </CardContent>
          </Card>

      {/* --- ADD/EDIT DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px]" title={isEdit ? "Edit Site" : "Add New Site"} onClose={() => setDialogOpen(false)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><Label>Site Name <span className="text-red-500">*</span></Label><Input value={state.sitename} onChange={(e) => storeDispatch(e.target.value, "sitename", "text")} /></div>
                 <div><Label>Location <span className="text-red-500">*</span></Label><Input value={state.location} onChange={(e) => storeDispatch(e.target.value, "location", "text")} /></div>
              </div>

               {/* UPDATED DROPDOWNS USING VISITOR FORM LOGIC */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <GlassSelect 
                        label="State"
                        value={state.StateID}
                        displayKey="StateName"
                        valueKey="StateIDPK" 
                        options={stateList}
                        onChange={(e) => storeDispatch(e, 'StateID', 'select')}
                        onFocus={() => getStateList()}
                        placeholder="Select State"
                    />
                 </div>
                 <div>
                    <GlassSelect 
                        label="City"
                        value={state.cityId}
                        displayKey="CityName"
                        valueKey="CityIDPK" // Field name from Visitor Form
                        options={cityList}
                        onChange={(e) => storeDispatch(e, 'CityID', 'select')}
                        onFocus={() => getCityList()}
                        placeholder="Select City"
                        disabled={!state.StateID}
                    />
                 </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><Label>Site Type</Label><Input value={state.siteType} onChange={(e) => storeDispatch(e.target.value, "siteType", "text")} /></div>
                 <div><Label>Sub Type</Label><Input value={state.subType} onChange={(e) => storeDispatch(e.target.value, "subType", "text")} /></div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><Label>Total Area</Label><Input value={state.totalArea} onChange={(e) => storeDispatch(e.target.value, "totalArea", "text")} /></div>
                 <div><Label>Zipcode</Label><Input value={state.zipcode} onChange={(e) => storeDispatch(e.target.value, "zipcode", "text")} /></div>
              </div>
              <div><Label>Address</Label><Textarea value={state.address} onChange={(e) => storeDispatch(e.target.value, "address", "text")} /></div>
              <div><Label>Description</Label><Textarea value={state.description} onChange={(e) => storeDispatch(e.target.value, "description", "text")} /></div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
                 <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                 <Button onClick={Validate} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isEdit ? 'Update' : 'Save')}</Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- VIEW DIALOG --- */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px]" title="Site Details" onClose={() => setViewOpen(false)}>
            <div className="space-y-3">
               {Object.entries(viewData).map(([key, val]) => (
                  <div key={key} className="flex flex-col sm:flex-row justify-between border-b border-slate-800 pb-2 last:border-0 gap-1">
                      <span className="text-slate-400 font-medium text-sm">{key}</span>
                      <span className="text-white font-bold text-sm sm:text-right break-words max-w-full sm:max-w-[70%]">{val}</span>
                  </div>
               ))}
            </div>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM --- */}
      <ConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.description} onConfirm={confirmState.action} onCancel={() => setConfirmState({ ...confirmState, open: false })} loading={loading} />

    </div>
  );
}

export default function Sites() {
  return (
    <ToastProvider>
      <SitesContent />
    </ToastProvider>
  );
}