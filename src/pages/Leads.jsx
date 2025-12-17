import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Upload, Loader2, Eye, Pencil, Trash2, X, ChevronDown, MapPin, Briefcase, DollarSign, User, Calendar, PhoneCall, UserMinus, Users, UserPlus, Phone, FileText, Contact } from 'lucide-react';

// --- CONFIGURATION & IMPORTS ---
// NOTE: In your local environment, ensure these paths are correct.
import { Helmet } from 'react-helmet';
import { config } from '@/components/CustomComponents/config.js'; // Assumed
import { useAuth } from '@/contexts/AuthContext'; // Assumed
import { useNavigate } from "react-router-dom"; // Assumed

// --- MOCK DATA (Retained for Status/Source, replace with API fetches if needed) ---
const MOCK_LEAD_STATUSES = [
    { _id: 'S1', name: 'New' }, { _id: 'S2', name: 'Contacted' }, { _id: 'S3', name: 'Qualified' },
    { _id: 'S4', name: 'Follow Up' }, { _id: 'S5', name: 'Site Visit' }, { _id: 'S6', name: 'Proposal Sent' },
    { _id: 'S7', name: 'Negotiation' }, { _id: 'S8', name: 'Won' }, { _id: 'S9', name: 'Lost' },
];

const MOCK_LEAD_SOURCES = [
    { _id: 'R1', name: 'Website' }, { _id: 'R2', name: 'Referral' }, { _id: 'R3', name: 'Social Media' },
    { _id: 'R4', name: 'Paid Ads' }, { _id: 'R5', name: 'Outbound' },
];

const AVAILABLE_AGENTS = [
    { _id: 'A1', name: 'Ramesh' }, { _id: 'A2', name: 'Suresh' }, { _id: 'A3', name: 'Sundhar' },
    { _id: 'A4', name: 'Priya' }, { _id: 'A5', name: 'John Agent' }
];

const statusColors = {
    'New': 'bg-blue-600 text-white', 'Contacted': 'bg-indigo-600 text-white', 'Qualified': 'bg-purple-600 text-white',
    'Proposal Sent': 'bg-yellow-600 text-white', 'Negotiation': 'bg-orange-600 text-white', 'Won': 'bg-green-600 text-white',
    'Lost': 'bg-red-600 text-white', 'Follow Up': 'bg-pink-600 text-white', 'Site Visit': 'bg-emerald-600 text-white',
    'Junk': 'bg-slate-600 text-slate-300', 'Closed': 'bg-slate-700 text-slate-300',
};

// --- INLINE UI COMPONENTS (Replicated as provided) ---
const Card = ({ className, children }) => (<div className={`rounded-lg border bg-slate-900 border-slate-800 shadow-sm ${className}`}>{children}</div>);
const CardContent = ({ className, children }) => (<div className={className}>{children}</div>);
const Badge = ({ className, children }) => (<div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${className}`}>{children}</div>);
const Button = ({ className, variant = "default", size = "default", onClick, disabled, children, type = "button", title }) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = { default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700", outline: "border border-slate-700 hover:bg-slate-800 text-slate-100", ghost: "hover:bg-slate-800 text-slate-100", destructive: "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50", icon: "bg-transparent hover:bg-slate-800 text-slate-300" };
    const sizes = { default: "h-10 px-4 py-2", icon: "h-9 w-9", sm: "h-8 rounded-md px-3 text-xs" };
    return (<button type={type} className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`} onClick={onClick} disabled={disabled} title={title}>{children}</button>);
};
const Input = ({ className, ...props }) => (<input className={`flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-100 ${className}`} {...props} />);
const Label = ({ children, htmlFor }) => (<label htmlFor={htmlFor} className="text-sm font-medium leading-none text-slate-300 block mb-2">{children}</label>);

// --- CUSTOM DIALOG COMPONENTS (Replicated as provided) ---
const Dialog = ({ open, onOpenChange, children }) => (<AnimatePresence>{open && (<div className="fixed inset-0 z-50 flex items-center justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onOpenChange(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />{children}</div>)}</AnimatePresence>);
const DialogContent = ({ className, children }) => (<motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`relative z-50 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-lg ${className}`} onClick={(e) => e.stopPropagation()}>{children}</motion.div>);
const DialogHeader = ({ className, children }) => (<div className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b border-slate-800 ${className}`}>{children}</div>);
const DialogTitle = ({ className, children }) => (<h2 className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}>{children}</h2>);
const DialogFooter = ({ className, children }) => (<div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-slate-800 bg-slate-950 ${className}`}>{children}</div>);

// --- TOAST SYSTEM (Replicated as provided) ---
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
                    {toasts.map((t) => (<motion.div key={t.id} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${t.variant === 'destructive' ? 'bg-red-900/90 border-red-800 text-white' : t.variant === 'success' ? 'bg-green-900/90 border-green-800 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-sm'}`}>
                        <div>{t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}{t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}</div>
                        <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                    </motion.div>))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
const useToast = () => useContext(ToastContext);

// --- ASSIGN DIALOG (Replicated as provided) ---
const AssignDialog = ({ open, onOpenChange, lead, onSuccess }) => {
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && lead) {
            const currentAgent = AVAILABLE_AGENTS.find(a => a.name === lead.assignedTo);
            setSelectedAgentId(currentAgent ? currentAgent._id : '');
        }
    }, [open, lead]);

    const handleSubmit = async () => {
        if (!selectedAgentId) {
            toast({ title: "Validation Error", description: "Please select an agent.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const url = config.Api + "Lead/updateLead";
            const agentName = AVAILABLE_AGENTS.find(a => a._id === selectedAgentId)?.name || 'Unknown';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: lead.id,
                    updateData: { leadAssignedId: selectedAgentId }
                })
            });
            const result = await response.json();
            if (result.success || response.ok) {
                toast({ title: "Assigned", description: `Lead assigned to ${agentName}`, variant: "success" });
                onSuccess();
                onOpenChange(false);
            } else {
                throw new Error(result.message || "Failed to assign agent");
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: `Failed to assign agent. ${error.message}`, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex justify-between items-center w-full">
                        <DialogTitle>Assign Lead</DialogTitle>
                        <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                    </div>
                </DialogHeader>
                <div className="p-6">
                    <p className="text-sm text-slate-400 mb-4">Assigning lead <span className="text-white font-medium">{lead?.name}</span></p>
                    <Label>Select Agent</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600"
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                    >
                        <option value="">-- Choose Agent --</option>
                        {AVAILABLE_AGENTS.map(agent => (<option key={agent._id} value={agent._id}>{agent.name}</option>))}
                    </select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedAgentId}>
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Confirm Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- CALL DIALOG (Replicated as provided) ---
const CallDialog = ({ open, onOpenChange, number }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                    <div className="flex justify-between items-center w-full">
                        <DialogTitle>Call Lead</DialogTitle>
                        <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                    </div>
                </DialogHeader>
                <div className="p-6 text-center">
                    <p className="text-slate-400 mb-4">Phone Number</p>
                    <h2 className="text-2xl font-bold text-white mb-6">{number}</h2>
                    <Button className="bg-green-600 hover:bg-green-700 w-full"><Phone className="mr-2 w-4 h-4" /> Call Now</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- LEAD DIALOG COMPONENT (DYNAMICISED WITH API & FORMDATA) ---

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 mt-6 first:mt-0">
        <Icon className="w-4 h-4 text-fuchsia-500" />
        <h3 className="text-sm font-bold text-fuchsia-100 uppercase tracking-wider">{title}</h3>
    </div>
);

const initialFormState = {
    leadFirstName: '', leadLastName: '', leadEmail: '', leadPhone: '', leadJobTitle: '', leadLinkedIn: '',
    leadAddress: '', leadCityId: '', leadStateId: '', leadCountryId: '', leadZipCode: '',
    leadStatusId: MOCK_LEAD_STATUSES[0]._id,
    leadSourceId: MOCK_LEAD_SOURCES[0]._id,
    leadPotentialValue: 0,
    leadScore: 0,
    leadTags: '',
    leadFiles: []
};

const LeadDialog = ({ open, onOpenChange, onSuccess, initialData, mode = 'create' }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentsToUpload, setDocumentsToUpload] = useState([]);
    const [activeFormTab, setActiveFormTab] = useState("contact");

    // --- API LIST STATES ---
    const [availableStatuses] = useState(MOCK_LEAD_STATUSES);
    const [availableSources] = useState(MOCK_LEAD_SOURCES);
    const [availableCountries, setAvailableCountries] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);

    const { toast } = useToast();
    const isViewMode = mode === 'view';

    // --- API Fetching Functions ---

    const getCountryList = useCallback(async () => {
        try {
            let url = config.Api + "Country/getAllCountry";
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}), });
            const result = await response.json();
            setAvailableCountries(Array.isArray(result) ? result : result.data || []);
        } catch (error) { setAvailableCountries([]); }
    }, [config.Api]);

    const getStateList = useCallback(async (countryId) => {
        if (!countryId) { setAvailableStates([]); return; }
        try {
            let url = config.Api + "State/getAllStates";
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ CountryID: countryId }), });
            const result = await response.json();
            setAvailableStates(Array.isArray(result) ? result : result.data || []);
        } catch (error) { setAvailableStates([]); }
    }, [config.Api]);

    const getCityList = useCallback(async (stateId) => {
        if (!stateId) { setAvailableCities([]); return; }
        try {
            let url = config.Api + "City/getAllCitys";
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ StateID: stateId }), });
            const result = await response.json();
            setAvailableCities(Array.isArray(result) ? result : result.data || []);
        } catch (error) { setAvailableCities([]); }
    }, [config.Api]);


    // --- 1. Load Data/Lookups on Dialog Open ---
    useEffect(() => {
        if (open) {
            getCountryList();

            if (initialData) {
                setFormData({
                    leadFirstName: initialData.leadFirstName || '', leadLastName: initialData.leadLastName || '',
                    leadEmail: initialData.leadEmail || '', leadPhone: initialData.leadPhone || '',
                    leadJobTitle: initialData.leadJobTitle || '', leadLinkedIn: initialData.leadLinkedIn || '',
                    leadAddress: initialData.leadAddress || '',
                    // Get ID from populated object or fallback to raw ID string
                    leadCountryId: initialData.leadCountryId?._id || initialData.leadCountryId || '',
                    leadStateId: initialData.leadStateId?._id || initialData.leadStateId || '',
                    leadCityId: initialData.leadCityId?._id || initialData.leadCityId || '',
                    leadZipCode: initialData.leadZipCode || '',
                    leadStatusId: initialData.leadStatusId?._id || initialData.leadStatusId || MOCK_LEAD_STATUSES[0]._id,
                    leadSourceId: initialData.leadSourceId?._id || initialData.leadSourceId || MOCK_LEAD_SOURCES[0]._id,
                    leadPotentialValue: initialData.leadPotentialValue || 0, leadScore: initialData.leadScore || 0,
                    leadTags: initialData.leadTags ? (Array.isArray(initialData.leadTags) ? initialData.leadTags.join(', ') : initialData.leadTags) : '',
                    leadFiles: []
                });

                const countryId = initialData.leadCountryId?._id || initialData.leadCountryId;
                const stateId = initialData.leadStateId?._id || initialData.leadStateId;
                if (countryId) getStateList(countryId);
                if (stateId) getCityList(stateId);

            } else {
                setFormData(initialFormState);
            }
            setDocumentsToUpload([]);
        }
    }, [open, initialData, getCountryList, getStateList, getCityList]);


    // --- 2. Cascading Selects ---
    useEffect(() => {
        if (open && formData.leadCountryId) {
            getStateList(formData.leadCountryId);
            if (initialData && formData.leadCountryId === (initialData.leadCountryId?._id || initialData.leadCountryId)) return;
            setFormData(prev => ({ ...prev, leadStateId: '', leadCityId: '' }));
        } else if (open && !formData.leadCountryId) {
            setAvailableStates([]); setAvailableCities([]);
            setFormData(prev => ({ ...prev, leadStateId: '', leadCityId: '' }));
        }
    }, [formData.leadCountryId, open, getStateList]);

    useEffect(() => {
        if (open && formData.leadStateId) {
            getCityList(formData.leadStateId);
            if (initialData && formData.leadStateId === (initialData.leadStateId?._id || initialData.leadStateId)) return;
            setFormData(prev => ({ ...prev, leadCityId: '' }));
        } else if (open && !formData.leadStateId) {
            setAvailableCities([]);
            setFormData(prev => ({ ...prev, leadCityId: '' }));
        }
    }, [formData.leadStateId, open, getCityList]);


    // --- 3. Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setDocumentsToUpload(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        setIsSubmitting(true);

        try {
            const isEdit = mode === 'edit';
            const endpoint = isEdit ? 'Lead/updateLead' : 'Lead/createLead';
            let response;

            if (isEdit) {
                const updateData = {
                    leadFirstName: formData.leadFirstName, leadLastName: formData.leadLastName, leadEmail: formData.leadEmail,
                    leadPhone: formData.leadPhone, leadJobTitle: formData.leadJobTitle, leadLinkedIn: formData.leadLinkedIn,
                    leadAddress: formData.leadAddress, leadCityId: formData.leadCityId || null, leadStateId: formData.leadStateId || null,
                    leadCountryId: formData.leadCountryId || null, leadZipCode: formData.leadZipCode,
                    leadStatusId: formData.leadStatusId, leadSourceId: formData.leadSourceId,
                    leadPotentialValue: Number(formData.leadPotentialValue), leadScore: Number(formData.leadScore),
                    leadTags: formData.leadTags.split(',').map(t => t.trim()).filter(t => t),
                };
                response = await fetch(`${config.Api}${endpoint}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leadId: initialData._id, updateData: updateData })
                });

            } else {
                // CREATE: Send FormData with files
                const payload = new FormData();
                Object.keys(formData).forEach(key => {
                    if (key !== 'leadFiles') { payload.append(key, formData[key] || ''); }
                });
                documentsToUpload.forEach(file => { payload.append('leadFiles', file, file.name); });
                payload.set('leadTags', formData.leadTags.split(',').map(t => t.trim()).filter(t => t).join(','));

                response = await fetch(`${config.Api}${endpoint}`, { method: 'POST', body: payload });
            }

            const result = await response.json();
            if (result.success) {
                toast({ title: isEdit ? "Lead Updated" : "Lead Created", description: result.message, variant: "success" });
                onOpenChange(false); onSuccess();
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error("Submit Error:", error);
            toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon, active, onClick }) => {
        const isActive = active === id;
        return (
            <button type="button" onClick={() => onClick(id)} className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${isActive ? "bg-fuchsia-600 text-white shadow-md" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"}`}>
                {Icon && <Icon className="w-4 h-4" />}
                <span className='hidden md:inline'> {label}</span>
                {isActive && (<motion.div layoutId="activeFormTab" className="absolute inset-0 rounded-md bg-fuchsia-600 -z-10" />)}
            </button>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader>
                    <div className="flex justify-between items-center w-full">
                        <DialogTitle>{mode === 'create' ? 'Add New Lead' : mode === 'edit' ? 'Edit Lead' : 'Lead Details'}</DialogTitle>
                        <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
                    <form id="lead-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800">
                            <TabButton id="contact" label="Contact & Address" icon={Contact} active={activeFormTab} onClick={setActiveFormTab} />
                            <TabButton id="deal" label="Deal & Status" icon={DollarSign} active={activeFormTab} onClick={setActiveFormTab} />
                            {!isViewMode && <TabButton id="document" label="Documents" icon={FileText} active={activeFormTab} onClick={setActiveFormTab} />}
                        </div>

                        {activeFormTab === "contact" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="leadFirstName">First Name *</Label><Input id="leadFirstName" name="leadFirstName" value={formData.leadFirstName} onChange={handleChange} required disabled={isViewMode} /></div>
                                <div><Label htmlFor="leadLastName">Last Name</Label><Input id="leadLastName" name="leadLastName" value={formData.leadLastName} onChange={handleChange} disabled={isViewMode} /></div>
                                <div><Label htmlFor="leadEmail">Email *</Label><Input id="leadEmail" name="leadEmail" type="email" value={formData.leadEmail} onChange={handleChange} required disabled={isViewMode} /></div>
                                <div><Label htmlFor="leadPhone">Phone *</Label><Input id="leadPhone" name="leadPhone" value={formData.leadPhone} onChange={handleChange} required disabled={isViewMode} /></div>
                                <div><Label htmlFor="leadJobTitle">Job Title</Label><Input id="leadJobTitle" name="leadJobTitle" value={formData.leadJobTitle} onChange={handleChange} disabled={isViewMode} /></div>
                                <div><Label htmlFor="leadLinkedIn">LinkedIn Profile</Label><Input id="leadLinkedIn" name="leadLinkedIn" value={formData.leadLinkedIn} onChange={handleChange} placeholder="https://linkedin.com/in/..." disabled={isViewMode} /></div>

                                <div className="md:col-span-2"><SectionHeader icon={MapPin} title="Address Details" /></div>

                                <div><Label htmlFor="leadAddress">Street Address</Label><Input id="leadAddress" name="leadAddress" value={formData.leadAddress} onChange={handleChange} disabled={isViewMode} /></div>

                                <div>
                                    <Label htmlFor="leadCountryId">Country</Label>
                                    <select name="leadCountryId" id="leadCountryId" value={formData.leadCountryId} onChange={handleChange} disabled={isViewMode} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50">
                                        <option value="">Select Country</option>
                                        {availableCountries.map(c => <option key={c._id || c.CountryID} value={c._id || c.CountryID}>{c.name || c.CountryName}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="leadStateId">State</Label>
                                    <select name="leadStateId" id="leadStateId" value={formData.leadStateId} onChange={handleChange} disabled={isViewMode || !formData.leadCountryId} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50">
                                        <option value="">Select State</option>
                                        {availableStates.map(s => <option key={s._id || s.StateID} value={s._id || s.StateID}>{s.name || s.StateName}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="leadCityId">City</Label>
                                    <select name="leadCityId" id="leadCityId" value={formData.leadCityId} onChange={handleChange} disabled={isViewMode || !formData.leadStateId} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50">
                                        <option value="">Select City</option>
                                        {availableCities.map(c => <option key={c._id || c.CityID} value={c._id || c.CityID}>{c.name || c.CityName}</option>)}
                                    </select>
                                </div>

                                <div><Label htmlFor="leadZipCode">Zip Code</Label><Input id="leadZipCode" name="leadZipCode" value={formData.leadZipCode} onChange={handleChange} disabled={isViewMode} /></div>
                            </div>
                        )}

                        {activeFormTab === "deal" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Status *</Label>
                                    <select name="leadStatusId" value={formData.leadStatusId} onChange={handleChange} disabled={isViewMode} required className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50">
                                        {availableStatuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <Label>Source</Label>
                                    <select name="leadSourceId" value={formData.leadSourceId} onChange={handleChange} disabled={isViewMode} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50">
                                        {availableSources.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="leadPotentialValue">Potential Value</Label>
                                    <div className="flex gap-2">
                                        <Input id="leadPotentialValue" name="leadPotentialValue" type="number" value={formData.leadPotentialValue} onChange={handleChange} disabled={isViewMode} />
                                        <Input name="currency" value={'₹'} className="w-24 text-center" disabled />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="leadScore">Lead Score (0-100)</Label>
                                    <Input id="leadScore" name="leadScore" type="number" value={formData.leadScore} onChange={handleChange} disabled={isViewMode} />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="leadTags">Tags (comma separated)</Label>
                                    <Input id="leadTags" name="leadTags" value={formData.leadTags} onChange={handleChange} placeholder="vip, urgent, q4-target" disabled={isViewMode} />
                                </div>
                            </div>
                        )}

                        {activeFormTab === "document" && mode === 'create' && (
                            <div>
                                <SectionHeader icon={FileText} title="Document Attachment (Max 5)" />
                                <Label htmlFor="leadFiles">Select Files for Upload (PDF, JPG, PNG)</Label>
                                <Input id="leadFiles" name="leadFiles" type="file" multiple accept=".pdf,image/jpeg,image/png" onChange={handleFileChange} />
                                <div className="mt-2 text-sm text-slate-400">
                                    {documentsToUpload.length > 0 ? (<p>{documentsToUpload.length} file(s) selected for upload.</p>) : (<p>No files selected.</p>)}
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>{isViewMode ? 'Close' : 'Cancel'}</Button>
                    {!isViewMode && (
                        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || (mode === 'create' && (!formData.leadFirstName || !formData.leadEmail || !formData.leadPhone))}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {mode === 'edit' ? 'Save Changes' : 'Create Lead'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// --- MAIN LEADS CONTENT ---

function LeadsContent() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [callDialogOpen, setCallDialogOpen] = useState(false);
    const [callNumber, setCallNumber] = useState('');
    const [activeTab, setActiveTab] = useState('new');
    const [selectedLead, setSelectedLead] = useState(null);
    const [dialogMode, setDialogMode] = useState('create');
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [leadToAssign, setLeadToAssign] = useState(null);
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);
    const [notesLead, setNotesLead] = useState(null);
    const [noteText, setNoteText] = useState('');

    const { toast } = useToast();
    const navigate = useNavigate()
    const { getPermissionsByPath } = useAuth();
    const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false })

    const openNotesDialog = (lead) => {
        setNotesLead(lead); setNoteText(''); setNotesDialogOpen(true);
    };

    const mapLeadData = (lead) => {
        const status = MOCK_LEAD_STATUSES.find(s => s._id === (lead.leadStatusId?._id || lead.leadStatusId))?.name || 'Unknown';
        const source = MOCK_LEAD_SOURCES.find(s => s._id === (lead.leadSourceId?._id || lead.leadSourceId))?.name || 'Unknown';
        const assignedAgent = AVAILABLE_AGENTS.find(a => a._id === (lead.leadAssignedId?._id || lead.leadAssignedId))?.name || 'Unassigned';

        return {
            id: lead._id,
            name: `${lead.leadFirstName || ''} ${lead.leadLastName || ''}`.trim(),
            email: lead.leadEmail, phone: lead.leadPhone, source: source, status: status,
            site: lead.leadCityId?.name || 'N/A', // Using leadCityId name for 'site' display
            assignedTo: assignedAgent,
            lastContact: new Date(lead.updatedAt || lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            original: lead
        };
    };

    const fetchLeads = async (search = '') => {
        setLoading(true);
        try {
            let url = config.Api + "Lead/getAllLeads";
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 1, limit: 50, search: search }) });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                const mappedLeads = data.data.map(mapLeadData);
                setLeads(mappedLeads);
            } else {
                // Mock Data Fallback (Adjusted to flat schema for consistency)
                const mockLeads = [
                    { _id: '101', leadFirstName: 'Priya', leadLastName: 'Menon', leadEmail: 'priya.m@gmail.com', leadPhone: '+91 98765 12345', leadStatusId: 'S1', leadSourceId: 'R1', leadCityId: { name: 'Chennai' }, leadAssignedId: null, updatedAt: new Date().toISOString() },
                    { _id: '104', leadFirstName: 'Suresh', leadLastName: 'Reddy', leadEmail: 'suresh.r@gmail.com', leadPhone: '+91 91234 56789', leadStatusId: 'S4', leadSourceId: 'R2', leadCityId: { name: 'Salem' }, leadAssignedId: 'A1', updatedAt: new Date(Date.now() - 259200000).toISOString() },
                    { _id: '112', leadFirstName: 'Anita', leadLastName: 'Roy', leadEmail: 'anita.r@yahoo.com', leadPhone: '+91 77665 54433', leadStatusId: 'S5', leadSourceId: 'R2', leadCityId: { name: 'Bangalore' }, leadAssignedId: 'A2', updatedAt: new Date(Date.now() - 404800000).toISOString() },
                    { _id: '109', leadFirstName: 'John', leadLastName: 'Doe', leadEmail: 'john@example.com', leadPhone: '+1 123 456 7890', leadStatusId: 'S1', leadSourceId: 'R1', leadCityId: { name: 'New Delhi' }, leadAssignedId: null, updatedAt: new Date(Date.now() - 604800000).toISOString() },
                    { _id: '102', leadFirstName: 'Rajesh', leadLastName: 'Kumar', leadEmail: 'rajesh.k@yahoo.com', leadPhone: '+91 87654 98765', leadStatusId: 'S2', leadSourceId: 'R3', leadCityId: { name: 'Mumbai' }, leadAssignedId: 'A3', updatedAt: new Date(Date.now() - 86400000).toISOString() },
                    { _id: '111', leadFirstName: 'Amit', leadLastName: 'Singh', leadEmail: 'amit.s@outlook.com', leadPhone: '+91 99887 77665', leadStatusId: 'S1', leadSourceId: 'R4', leadCityId: { name: 'Chennai' }, leadAssignedId: 'A1', updatedAt: new Date().toISOString() },
                ].map(mapLeadData);
                setLeads(mockLeads);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
            // Fallback: If initial load fails, use static mock data to render the UI
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPermissionsByPath(window.location.pathname).then(res => {
            if (res) {
                setPermissions(res);
                if (res.isView) { fetchLeads(); }
            } else { navigate('/dashboard'); }
        });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { if (searchTerm) fetchLeads(searchTerm); }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleCreate = () => { setSelectedLead(null); setDialogMode('create'); setDialogOpen(true); };
    const handleView = (lead) => { setSelectedLead(lead.original); setDialogMode('view'); setDialogOpen(true); };
    const handleEdit = (lead) => { setSelectedLead(lead.original); setDialogMode('edit'); setDialogOpen(true); };
    const handleAssign = (lead) => { setLeadToAssign(lead); setAssignDialogOpen(true); };
    const handleLeadSaved = () => { fetchLeads(searchTerm); setDialogOpen(false); setSelectedLead(null); };

    const handleDelete = async (leadId) => {
        if (!window.confirm("Are you sure you want to archive this lead?")) return;
        try {
            let url = config.Api + "Lead/deleteLeads";
            const DELETED_STATUS_ID = MOCK_LEAD_STATUSES.find(s => s.name === 'Lost')?.['$_id'] || 'S9';
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, deletedStatusId: DELETED_STATUS_ID }) });
            const result = await response.json();
            if (result.success) { toast({ title: "Archived", description: "Lead archived successfully.", variant: "success" }); fetchLeads(searchTerm); }
            else { throw new Error(result.message); }
        } catch (error) { toast({ title: "Error", description: `Failed to archive lead. ${error.message}`, variant: "destructive" }); }
    };

    const handleSaveNote = async () => {
        if (!noteText.trim() || !notesLead) { toast({ title: "Validation Error", description: "Note cannot be empty.", variant: "destructive" }); return; }
        try {
            const url = config.Api + "Lead/addLeadNote";
            const response = await fetch(url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: notesLead.id, details: noteText }),
            });
            const result = await response.json();
            if (result.success) { toast({ title: "Note Saved", description: "Note added to lead history.", variant: "success" }); fetchLeads(searchTerm); setNotesDialogOpen(false); }
            else { throw new Error(result.message || "Failed to save note."); }
        } catch (error) { console.error("Save Note Error:", error); toast({ title: "Error", description: error.message, variant: "destructive" }); }
    };

    const getFilteredLeads = () => {
        return leads.filter(lead => {
            const status = lead.status.toLowerCase();
            const assignedTo = lead.assignedTo;
            switch (activeTab) {
                case 'new': return status === 'new';
                case 'followups': return status.includes('follow');
                case 'visits': return status.includes('visit') || status.includes('scheduled');
                case 'unassigned': return assignedTo === 'Unassigned' || !assignedTo;
                case 'all': default: return true;
            }
        });
    };
    const filteredLeads = getFilteredLeads();

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md ${activeTab === id ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
            {Icon && <Icon className="w-4 h-4" />}{label}
            {activeTab === id && (<motion.div layoutId="activeTabLead" className="absolute inset-0 rounded-md bg-fuchsia-600 -z-10" />)}
        </button>
    );

    return (
        <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">
            {/* Header and Actions */}
            <div className="flex md:flex-row flex-col items-start md:justify-between gap-3">
                <h1 className="text-3xl font-bold text-white">Leads</h1>
                <div className="flex md:flex-row flex-col gap-3">
                    <Button variant="outline" onClick={() => toast({ title: "Import", description: "Feature coming soon." })} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><Upload className="w-4 h-4 mr-2" />Import</Button>
                    <Button variant="outline" onClick={() => toast({ title: "Export", description: "Feature coming soon." })} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><Download className="w-4 h-4 mr-2" />Export</Button>
                    {Permissions.isAdd && <Button onClick={handleCreate} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold border-0"><Plus className="w-4 h-4 mr-2" />Add Lead</Button>}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800">
                <TabButton id="new" label="New Leads" icon={Plus} />
                <TabButton id="followups" label="Follow-ups" icon={PhoneCall} />
                <TabButton id="visits" label="Visits" icon={MapPin} />
                <TabButton id="unassigned" label="Unassigned" icon={UserMinus} />
                <TabButton id="all" label="All Leads" icon={Users} />
            </div>

            {/* Desktop Table View */}
            <Card className='md:block hidden'>
                <CardContent className="p-6 " >
                    {/* Search/Filter Bar */}
                    <div className="flex gap-4 mb-6"><div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
                        <Input placeholder="Search leads by name, email or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200 focus-visible:ring-fuchsia-500" />
                    </div>
                        <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><Filter className="w-4 h-4 mr-2" />Filter</Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Name</th><th className="text-left py-3 px-4 text-sm font-semibold text-white">City</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Phone</th><th className="text-left py-3 px-4 text-sm font-semibold text-white">Source</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th><th className="text-left py-3 px-4 text-sm font-semibold text-white">Assigned To</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && leads.length === 0 ? (<tr><td colSpan="7" className="text-center py-8"><div className="flex justify-center items-center text-fuchsia-400"><Loader2 className="animate-spin mr-2" /> Loading leads...</div></td></tr>)
                                    : filteredLeads.length === 0 ? (<tr><td colSpan="7" className="text-center py-8 text-slate-400">No {activeTab === 'all' ? '' : activeTab} leads found.</td></tr>)
                                        : (filteredLeads.map((lead, index) => (
                                            <motion.tr key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                                                <td className="py-3 px-4 text-sm font-medium text-white"><div onClick={() => openNotesDialog(lead)} className="flex items-center gap-2 cursor-pointer group hover:text-fuchsia-400"><span className="underline-offset-4 group-hover:underline">{lead.name}</span></div></td>
                                                <td className="py-3 px-4 text-sm text-slate-300">{lead.site}</td>
                                                <td className="py-3 px-4 text-sm text-slate-300 flex gap-2"><button onClick={() => { setCallNumber(lead.phone); setCallDialogOpen(true); }}><Phone size={18} className=' hover:text-fuchsia-400' /></button>{lead.phone}</td>
                                                <td className="py-3 px-4 text-sm text-slate-300">{lead.source}</td>
                                                <td className="py-3 px-4"><Badge className={statusColors[lead.status] || 'bg-slate-600'}>{lead.status}</Badge></td>
                                                <td className={`py-3 px-4 text-sm ${lead.assignedTo === 'Unassigned' ? 'text-red-300' : 'text-slate-300'}`}>{lead.assignedTo}</td>
                                                <td className="py-3 px-2 flex items-center">
                                                    <Button variant="icon" size="icon" title="Assign Agent" onClick={() => handleAssign(lead)} className="text-green-400 hover:text-green-300 hover:bg-green-900/20"><UserPlus className="w-4 h-4" /></Button>
                                                    <Button variant="icon" size="icon" title="View" onClick={() => handleView(lead)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"><Eye className="w-4 h-4" /></Button>
                                                    {Permissions.isEdit && <Button variant="icon" size="icon" title="Edit" onClick={() => handleEdit(lead)} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"><Pencil className="w-4 h-4" /></Button>}
                                                    {Permissions.isDelete && <Button variant="icon" size="icon" title="Delete" onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button>}
                                                </td>
                                            </motion.tr>
                                        )))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Mobile Card View */}
            <Card className='md:hidden block'>
                <CardContent className="p-6 " >
                    {/* Search/Filter Bar */}
                    <div className="flex gap-4 mb-6"><div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
                        <Input placeholder="Search leads by name, email or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200 focus-visible:ring-fuchsia-500" />
                    </div>
                        <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><Filter className="w-4 h-4 mr-2" />Filter</Button>
                    </div>

                    <div className="space-y-4">
                        {loading && leads.length === 0 ? (<div className="text-center py-6 text-fuchsia-400"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</div>)
                            : filteredLeads.length === 0 ? (<div className="text-center py-6 text-slate-400">No {activeTab === 'all' ? '' : activeTab} leads found.</div>)
                                : (filteredLeads.map((lead, index) => (
                                    <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-slate-900 border border-fuchsia-700/40 rounded-xl p-4 shadow-lg hover:bg-purple-800/60 transition-all">
                                        <div className="flex justify-between items-center mb-2 gap-2"><h3 className=" font-bold text-white">{lead.name}</h3><Badge className={statusColors[lead.status] || 'bg-slate-600'}>{lead.status}</Badge></div>
                                        <div className="flex items-center gap-2 mb-1 text-purple-300 text-sm"><MapPin className="w-4 h-4" /><span>{lead.site}</span></div>
                                        <div className="flex items-center gap-2 mb-1 text-fuchsia-300 text-sm"><Phone className="w-4 h-4" /><span>{lead.phone}</span></div>
                                        <div className={`flex items-center gap-2 mb-2 text-sm ${lead.assignedTo === 'Unassigned' ? 'text-red-300' : 'text-slate-300'}`}><User className="w-4 h-4" /><span>{lead.assignedTo}</span></div>
                                        <div className="flex justify-end gap-2 border-t border-purple-700/40 pt-2">
                                            <Button variant="icon" size="icon" onClick={() => handleAssign(lead)} className="text-green-400 hover:text-green-300 hover:bg-green-900/20"><UserPlus className="w-4 h-4" /></Button>
                                            <Button variant="icon" size="icon" onClick={() => handleView(lead)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"><Eye className="w-4 h-4" /></Button>
                                            {Permissions.isEdit && <Button variant="icon" size="icon" onClick={() => handleEdit(lead)} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"><Pencil className="w-4 h-4" /></Button>}
                                            {Permissions.isDelete && <Button variant="icon" size="icon" onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button>}
                                        </div>
                                    </motion.div>
                                )))}
                    </div>
                </CardContent>
            </Card>


            <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={handleLeadSaved} initialData={selectedLead} mode={dialogMode} />
            <AssignDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} lead={leadToAssign} onSuccess={() => fetchLeads(searchTerm)} />
            <CallDialog open={callDialogOpen} onOpenChange={setCallDialogOpen} number={callNumber} />

            {/* NOTES DIALOG */}
            <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader><div className="flex justify-between items-center w-full"><DialogTitle>Add Note</DialogTitle><button onClick={() => setNotesDialogOpen(false)}><X size={20} /></button></div></DialogHeader>
                    <div className="p-6">
                        <p className="text-sm text-slate-400 mb-2">Lead: <span className="text-white font-medium">{notesLead?.name}</span></p>
                        <Label>Notes</Label>
                        <textarea className="w-full h-28 bg-slate-900 border border-slate-700 rounded-md p-3 text-sm text-white focus:ring-2 focus:ring-fuchsia-600 outline-none" placeholder="Enter follow-up notes..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                    </div>
                    <DialogFooter><Button variant="ghost" onClick={() => setNotesDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveNote} disabled={!noteText.trim()}>Save Note</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function Leads() {
    return (
        <ToastProvider>
            <LeadsContent />
        </ToastProvider>
    );
}