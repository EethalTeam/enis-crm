import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PIOPIY from 'piopiyjs'
import { Plus, Search, Filter, Download, Upload, Loader2, Eye, Pencil, Trash2, X, ChevronDown, MapPin, Briefcase, DollarSign, User, Calendar, PhoneCall, UserMinus, Users, UserPlus, Phone, FileText, Contact, Clock, PhoneOff,ArrowUpFromLine } from 'lucide-react';

// --- CONFIGURATION & IMPORTS ---
import { config } from '@/components/CustomComponents/config.js';
import { useAuth } from '@/contexts/AuthContext';
const decode = (value) => {
  if (!value) return "";
  try {
    return atob(value);
  } catch (err) {
    console.error("Decode failed:", err);
    return "";
  }
};

import { useNavigate } from "react-router-dom";
//for Export 
import * as XLSX from "xlsx";
// TeleCMI Credentials
const CREDENTIALS = {
    userId: '5002_33336945',
    password: 'User@123',
    sbcUrl: 'sbcind.telecmi.com'
};

const statusColors = {
    'New': 'bg-blue-600 text-white', 'Contacted': 'bg-indigo-600 text-white', 'Qualified': 'bg-purple-600 text-white',
    'Proposal Sent': 'bg-yellow-600 text-white', 'Negotiation': 'bg-orange-600 text-white', 'Won': 'bg-green-600 text-white',
    'Lost': 'bg-red-600 text-white', 'Follow Up': 'bg-pink-600 text-white', 'Site Visit': 'bg-emerald-600 text-white',
    'Junk': 'bg-slate-600 text-slate-300', 'Closed': 'bg-slate-700 text-slate-300',
};

// --- UI COMPONENTS ---
const Card = ({ className, children }) => (<div className={`rounded-lg border bg-slate-900 border-slate-800 shadow-sm ${className}`}>{children}</div>);
const CardContent = ({ className, children }) => (<div className={className}>{children}</div>);
const Badge = ({ className, children }) => (<div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${className}`}>{children}</div>);
const Button = ({ className, variant = "default", size = "default", onClick, disabled, children, type = "button", title }) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = { default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700", outline: "border border-slate-700 hover:bg-slate-800 text-slate-100", ghost: "hover:bg-slate-800 text-slate-100", destructive: "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50", icon: "bg-transparent hover:bg-slate-800 text-slate-300" };
    const sizes = { default: "h-10 px-4 py-2", icon: "h-9 w-9", sm: "h-8 rounded-md px-3 text-xs" };
    return (<button type={type} className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`} onClick={onClick} disabled={disabled} title={title}>{children}</button>);
};
const Input = ({ className, ...props }) => (<input className={`flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-950 text-slate-100 ${className}`} {...props} />);
const Label = ({ children, htmlFor }) => (<label htmlFor={htmlFor} className="text-sm font-medium leading-none text-slate-300 block mb-2">{children}</label>);
const SectionHeader = ({ icon: Icon, title }) => (<div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 mt-6 first:mt-0"><Icon className="w-4 h-4 text-fuchsia-500" /><h3 className="text-sm font-bold text-fuchsia-100 uppercase tracking-wider">{title}</h3></div>);
const Dialog = ({ open, onOpenChange, children }) => (<AnimatePresence>{open && (<div className="fixed inset-0 z-50 flex items-center justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onOpenChange(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />{children}</div>)}</AnimatePresence>);
const DialogContent = ({ className, children }) => (<motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`relative z-50 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-lg ${className}`} onClick={(e) => e.stopPropagation()}>{children}</motion.div>);
const DialogHeader = ({ className, children }) => (<div className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b border-slate-800 ${className}`}>{children}</div>);
const DialogTitle = ({ className, children }) => (<h2 className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}>{children}</h2>);
const DialogFooter = ({ className, children }) => (<div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-slate-800 bg-slate-950 ${className}`}>{children}</div>);

// --- TOAST SYSTEM ---
const ToastContext = createContext({});
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toast = ({ title, description, variant = 'default' }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 3000);
    };
    const dismiss = (id) => { setToasts((prev) => prev.filter((t) => t.id !== id)); };
    return (<ToastContext.Provider value={{ toast }}>{children}<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none"><AnimatePresence>{toasts.map((t) => (<motion.div key={t.id} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${t.variant === 'destructive' ? 'bg-red-900/90 border-red-800 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-sm'}`}><div>{t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}{t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}</div><button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-white"><X size={16} /></button></motion.div>))}</AnimatePresence></div></ToastContext.Provider>);
};
const useToast = () => useContext(ToastContext);

// --- ASSIGN DIALOG ---
const AssignDialog = ({ open, onOpenChange, lead, onSuccess }) => {
    const [selectedAgent, setSelectedAgent] = useState('');
    const [availableAgents, setAvailableAgents] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    useEffect(() => {
        if (open) {
            fetch(config.Api + "Employee/getAllEmployees", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
                .then(res => res.json()).then(result => setAvailableAgents(Array.isArray(result) ? result : result.data || []));
            if (lead) setSelectedAgent(lead.original?.leadAssignedId?._id || '');
        }
    }, [open, lead]);
    const handleSubmit = async () => {
        if (!selectedAgent) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(config.Api + "Lead/assignLead", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: lead.id, leadAssignedId: selectedAgent, employeeName: user?.EmployeeName }) });
            if ((await res.json()).success) { toast({ title: "Assigned", variant: "success" }); onSuccess(); onOpenChange(false); }
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        finally { setIsSubmitting(false); }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader><div className="flex justify-between items-center w-full"><DialogTitle>Assign Lead</DialogTitle><button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div></DialogHeader>
                <div className="p-6"><p className="text-sm text-slate-400 mb-4">Assigning lead <span className="text-white font-medium">{lead?.name}</span></p><Label>Select Agent</Label><select className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}><option value="">-- Choose Agent --</option>{availableAgents.map(agent => (<option key={agent._id} value={agent._id}>{agent.EmployeeName || agent.name}</option>))}</select></div>
                <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Confirm Assignment</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- CALL DIALOG ---
const CallDialog = ({ open, onOpenChange, number, piopiyInstance, isLoggedIn }) => {
    const [callStatus, setCallStatus] = useState('Idle');
    useEffect(() => {
        if (!piopiyInstance) return;
        piopiyInstance.on('trying', () => setCallStatus('Calling...'));
        piopiyInstance.on('ringing', () => setCallStatus('Ringing...'));
        piopiyInstance.on('answered', () => setCallStatus('Connected'));
        piopiyInstance.on('ended', () => setCallStatus('Idle'));
    }, [piopiyInstance]);
    const handleAction = () => {
        if (callStatus === 'Idle') {
            const cleanNumber = number.replace(/\D/g, '');
            if (piopiyInstance) piopiyInstance.call(cleanNumber);
        } else { if (piopiyInstance) piopiyInstance.terminate(); }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[350px]">
                <DialogHeader><div className="flex justify-between items-center w-full"><DialogTitle>Call Lead</DialogTitle><button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div></DialogHeader>
                <div className="p-6 text-center">
                    <p className="text-slate-400 mb-4">Phone Number</p>
                    <h2 className="text-2xl font-bold text-white mb-6">{number}</h2>
                    <Button className={`w-full ${callStatus === 'Idle' ? 'bg-green-600' : 'bg-red-600'}`} onClick={handleAction} disabled={!isLoggedIn}>
                        {callStatus === 'Idle' ? <><Phone className="mr-2 w-4 h-4" /> Call Now</> : <><PhoneOff className="mr-2 w-4 h-4" /> End Call</>}
                        {(callStatus === 'Calling...' || callStatus === 'Ringing...') && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};






// --- LEAD DIALOG COMPONENT ---
const LeadDialog = ({ open, onOpenChange, onSuccess, initialData, mode = 'create', disablePhone = true }) => {
    const initialFormState = { leadFirstName: '', leadLastName: '', leadEmail: '', leadPhone: '91', leadJobTitle: '', leadLinkedIn: '', leadAddress: '', leadCityId: '', leadStateId: '', leadCountryId: '', leadZipCode: '', leadStatusId: '', leadSourceId: '', leadPotentialValue: 0, leadScore: '', leadTags: '', leadSiteId: '', leadNotes: '',leadAltPhone:'91' };
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lookups, setLookups] = useState({ status: [], source: [], country: [], state: [], city: [], document: [], site: [] });
    const [docRows, setDocRows] = useState([{ documentId: "", file: null }]);
    const [activeFormTab, setActiveFormTab] = useState("contact");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
          const role = localStorage.getItem("role");
    const siteId = decode(localStorage.getItem("SiteId")); 

    const isViewMode = mode === 'view';

    const fetchData = useCallback(async (endpoint, key) => {
        try {
            const res = await fetch(config.Api + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const result = await res.json();
            setLookups(prev => ({ ...prev, [key]: Array.isArray(result) ? result : result.data || [] }));
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        if (open) {
            fetchData("Country/getAllCountry", "country");
            fetchData("LeadStatus/getAllLeadStatus", "status");
            fetchData("LeadSource/getAllLeadSource", "source");
            fetchData("Document/getAllDocument", "document");
            fetchData("Site/getAllSites", "site");

            if (initialData) {
                setFormData({
                    ...initialData,
                    leadCountryId: initialData.leadCountryId?._id || '',
                    leadStateId: initialData.leadStateId?._id || '',
                    leadCityId: initialData.leadCityId?._id || '',
                    leadStatusId: initialData.leadStatusId?._id || '',
                    leadSourceId: initialData.leadSourceId?._id || '',
                    leadAssignedId: initialData.leadAssignedId?._id || '',
                    leadSiteId: initialData.leadSiteId?._id || '',
                    leadTags: Array.isArray(initialData.leadTags) ? initialData.leadTags.join(', ') : ''
                });

                // Populate docRows from initialData.leadDocument
                if (initialData.leadDocument && initialData.leadDocument.length > 0) {
                    const existingDocs = initialData.leadDocument
                        .filter(doc => doc && typeof doc === 'object' && doc.fileUrl)
                        .map(doc => ({
                            documentId: doc.documentId?._id || doc.documentId,
                            file: null,
                            // Clean the URL: remove backslashes so we only have the filename
                            existingUrl: doc.fileUrl.replace(/\\/g, ''),
                            fileName: doc.fileName
                        }));

                    setDocRows(existingDocs.length > 0 ? existingDocs : [{ documentId: "", file: null }]);
                } else {
                    setDocRows([{ documentId: "", file: null }]);
                }

                // ... (rest of your state/city fetch logic)
            } else {
                setFormData(initialFormState);
                setDocRows([{ documentId: "", file: null }]);
            }
        }
    }, [open, initialData, fetchData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        //  Phone number: allow only digits & max 10
        if (name === "leadPhone") {
            let phone = value.replace(/\D/g, "");

            // force 91 prefix
            if (!phone.startsWith("91")) {
                phone = "91";
            }

            // max length: 12 (91 + 10 digits)
            phone = phone.slice(0, 12);

            setFormData(prev => ({
                ...prev,
                leadPhone: phone
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'leadCountryId') fetch(config.Api + "State/getAllStates", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ CountryID: value }) }).then(r => r.json()).then(data => setLookups(p => ({ ...p, state: data, city: [] })));
        if (name === 'leadStateId') fetch(config.Api + "City/getAllCitys", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ StateID: value }) }).then(r => r.json()).then(data => setLookups(p => ({ ...p, city: data })));
    };

    const handleDocChange = (index, value) => {
        const updated = [...docRows]; updated[index].documentId = value; updated[index].file = null; setDocRows(updated);
    };

    // const handleFileChange = (index, file) => {
    //     const updated = [...docRows]; updated[index].file = file; setDocRows(updated);
    // };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    //  Block audio & video
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        toast({
            title: "Invalid File",
            description: "Audio and video files are not allowed",
            variant: "destructive"
        });
         e.target.value = ""; //  THIS IS THE KEY LINE
        return;
    }

    //  Allow only images & PDF
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
        toast({
            title: "Invalid File",
            description: "Only JPG, PNG images and PDF files are allowed",
            variant: "destructive"
        });
        return;
    }

    //  Update state
    const updated = [...docRows];
    updated[index].file = file;
    setDocRows(updated);
};


    const handleSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        const endpoint = mode === 'edit' ? 'Lead/updateLead' : 'Lead/createLead';

        // Use FormData for integrated creation and update
        const payload = new FormData();
        Object.keys(formData).forEach(key => payload.append(key, formData[key] || ''));
        if (mode === 'edit') payload.append('leadId', initialData._id);
        if (user?.id) payload.append('employeeId', user.id);

        // Filter for documents that are ALREADY on the server (they have an existingUrl)
        const retainedDocs = docRows
            .filter(row => row.existingUrl && !row.file) // Keep if it has URL and wasn't replaced by new file
            .map(row => ({
                documentId: row.documentId,
                fileName: row.fileName,
                fileUrl: row.existingUrl
            }));

        payload.append('existingDocs', JSON.stringify(retainedDocs));

        // Standard logic for new files remains the same
        docRows.forEach(row => {
            if (row.file) {
                payload.append('leadFiles', row.file);
                payload.append('documentIds', row.documentId);
            }
        });

        try {
            const res = await fetch(config.Api + endpoint, { method: 'POST', body: payload });
            const result = await res.json();
            if (result.success) { onOpenChange(false); onSuccess(); }
            else { toast({ title: "Error", description: result.message, variant: "destructive" }); }
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        finally { setIsSubmitting(false); }
    };

    const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
        <button type="button" onClick={() => onClick(id)} className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${active === id ? "bg-fuchsia-600 text-white shadow-md" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"}`}>
            {Icon && <Icon className="w-4 h-4" />}<span className='hidden md:inline'> {label}</span>
            {active === id && (<motion.div layoutId="activeFormTab" className="absolute inset-0 rounded-md bg-fuchsia-600 -z-10" />)}
        </button>
    );

    useEffect(() => {
  if (role === "AGENT" && siteId && open) {
    setFormData(prev => ({
      ...prev,
      leadSiteId: siteId
    }));
  }
}, [role, siteId, open]);



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader><div className="flex justify-between items-center w-full"><DialogTitle>{mode === 'create' ? 'Add New Lead' : mode === 'edit' ? 'Edit Lead' : 'Lead Details'}</DialogTitle><button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div></DialogHeader>
                <div className="overflow-y-auto p-6 custom-scrollbar flex-1"><form id="lead-form" onSubmit={handleSubmit} className="space-y-6"><div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800"><TabButton id="contact" label="Contact Information" icon={Contact} active={activeFormTab} onClick={setActiveFormTab} /><TabButton id="deal" label="Deal & Status" icon={DollarSign} active={activeFormTab} onClick={setActiveFormTab} /><TabButton id="document" label="Document" icon={FileText} active={activeFormTab} onClick={setActiveFormTab} />
                    <TabButton id="history" label="History" icon={Clock} active={activeFormTab} onClick={setActiveFormTab} />
                </div>
                    {activeFormTab === "contact" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>First Name *</Label><Input name="leadFirstName" value={formData.leadFirstName} onChange={handleChange} required  /></div>
                        <div><Label>Last Name</Label><Input name="leadLastName" value={formData.leadLastName} onChange={handleChange}  /></div>
                        <div><Label>Email *</Label><Input name="leadEmail" type="email" value={formData.leadEmail} onChange={handleChange} required disabled={isViewMode} /></div>
                        <div><Label>Phone *</Label><Input name="leadPhone" value={formData.leadPhone} onChange={handleChange} required disabled /></div>
                        <div><Label>Alter Phone *</Label><Input name="leadAltPhone" value={formData.leadAltPhone} onChange={handleChange} required disabled={isViewMode}/></div>


                        {/* <div><Label>Job Title</Label><Input name="leadJobTitle" value={formData.leadJobTitle} onChange={handleChange} disabled={isViewMode} /></div>
                        <div><Label>LinkedIn Profile</Label><Input name="leadLinkedIn" value={formData.leadLinkedIn} onChange={handleChange} disabled={isViewMode} /></div> */}
                        <div><Label>Street Address</Label><Input name="leadAddress" value={formData.leadAddress} onChange={handleChange} disabled={isViewMode} /></div>
                        <div><Label>Country</Label><select name="leadCountryId" value={formData.leadCountryId} onChange={handleChange} disabled={isViewMode} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"><option value="">Select</option>{lookups.country.map(c => <option key={c._id} value={c._id}>{c.CountryName || c.name}</option>)}</select></div>
                        <div><Label>State</Label><select name="leadStateId" value={formData.leadStateId} onChange={handleChange} disabled={isViewMode} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"><option value="">Select</option>{lookups.state.map(s => <option key={s._id} value={s._id}>{s.StateName || s.name}</option>)}</select></div>
                        <div><Label>City</Label><select name="leadCityId" value={formData.leadCityId} onChange={handleChange} disabled={isViewMode} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"><option value="">Select</option>{lookups.city.map(c => <option key={c._id} value={c._id}>{c.CityName || c.name}</option>)}</select></div>
                       
                      <div><Label>Site</Label><select name="leadSiteId" value={formData.leadSiteId} onChange={handleChange}     disabled={isViewMode || role === "AGENT"} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"><option value="">Select</option>{lookups.site.map(s => <option key={s._id} value={s._id}>{s.sitename || s.name}</option>)}</select></div>
                      
                        <div><Label>Zip Code</Label><Input name="leadZipCode" value={formData.leadZipCode} onChange={handleChange} disabled={isViewMode} /></div>
                    </div>)}
                    {activeFormTab === "deal" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Status</Label><select name="leadStatusId" value={formData.leadStatusId} onChange={handleChange} disabled={isViewMode} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"><option value="">Select</option>{lookups.status.map(s => <option key={s._id} value={s._id}>{s.leadStatustName || s.name}</option>)}</select></div>
                        <div><Label>Source</Label><select name="leadSourceId" value={formData.leadSourceId} onChange={handleChange} disabled={isViewMode} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"><option value="">Select</option>{lookups.source.map(s => <option key={s._id} value={s._id}>{s.leadSourceName || s.name}</option>)}</select></div>
                        <div><Label>Potential Value</Label><div className="flex gap-2"><Input name="leadPotentialValue" type="number" value={formData.leadPotentialValue} onChange={handleChange} disabled={isViewMode} placeholder='₹' /></div></div>
                        <div>
                            <Label>Lead Score</Label>
                            <select name="leadScore" type="number" value={formData.leadScore} onChange={handleChange} disabled={isViewMode} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"  >
                                <option>Select</option>
                                <option>25%</option>
                                <option>50%</option>
                                <option>75%</option>
                                <option>100%</option>
                            </select>
                        </div>
                        <div className="md:col-span-2"><Label>Notes</Label><textarea name="leadNotes" value={formData.leadNotes} onChange={handleChange} disabled={isViewMode} className="w-full h-28 bg-slate-900 border border-slate-700 rounded-md p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-500" /></div>
                    </div>)}
                    {activeFormTab === "document" && (
                        <div>
                            <SectionHeader icon={FileText} title="Document Attachment" />
                            {docRows.map((row, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 md:gap-20 items-end mb-4">
                                    <div>
                                        <select
                                            value={row.documentId}
                                            onChange={(e) => handleDocChange(index, e.target.value)}
                                            className="w-full h-10 bg-slate-800 border border-slate-700 rounded-md px-3 text-sm text-gray-300"
                                            disabled={isViewMode}
                                        >
                                            <option value="">Select</option>
                                            {lookups.document.map(d => <option key={d._id} value={d._id}>{d.documentName}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col w-full">
                                        {row.documentId && (
                                            <>
                                                <Label>{row.existingUrl ? `Current File: ${row.fileName}` : 'Upload File'}</Label>
                                                <div className="flex items-center gap-2">
                                                    {!isViewMode && (
                                                        <input
                                                            type="file"
                                                            //   accept=".jpg,.jpeg,.png,.pdf"
                                                            className="flex-1 text-sm text-slate-300"
                                                            onChange={(e) => handleFileChange(index, e)}
                                                        />
                                                    )}

                                                    {/* Preview Logic for New File OR Existing File */}
                                                    {(row.file || row.existingUrl) && (
                                                        <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10"
                                                            onClick={() => {
                                                                let url;
                                                                if (row.file) {
                                                                    // Preview for newly selected local file
                                                                    url = URL.createObjectURL(row.file);
                                                                } else if (row.existingUrl) {
                                                                    // Preview for existing server file
                                                                    // Format: config.Api + lead_documents/ + filename
                                                                    url = `${config.Api}lead_documents/${row.existingUrl}`;

                                                                }

                                                                if (url) {
                                                                    setPreviewUrl(url);
                                                                    setIsPreviewOpen(true);
                                                                }
                                                            }}
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2 md:pb-1">
                                        {!isViewMode && (
                                            <>
                                                {docRows.length > 1 && (
                                                    <button type="button" onClick={() => setDocRows(docRows.filter((_, i) => i !== index))} className="h-8 w-8 rounded-md bg-white text-red-600 font-extrabold">–</button>
                                                )}
                                                {index === docRows.length - 1 && (
                                                    <button type="button" onClick={() => setDocRows([...docRows, { documentId: "", file: null }])} className="h-8 w-8 rounded-md bg-white text-green-600 font-extrabold">+</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* --- INTERNAL PREVIEW MODAL --- */}
                            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                                <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden">
                                    <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-800">
                                        <DialogTitle className="text-sm">Document Preview</DialogTitle>
                                        <button
                                            type="button" // <--- Add this!
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation(); // Prevents the click from reaching the form
                                                setIsPreviewOpen(false);
                                            }}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <X size={18} />
                                        </button>
                                    </DialogHeader>
                                    <div className="flex-1 bg-slate-900 p-2">
                                        {previewUrl && (
                                            <iframe
                                                src={previewUrl}
                                                className="w-full h-full rounded border-0"
                                                title="File Preview"
                                            />
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                    {/* {isViewMode && initialData?.leadHistory && (<div className="md:col-span-2 mt-4"><SectionHeader icon={Clock} title="History" /><div className="space-y-3">{initialData.leadHistory.map((h, i) => (<div key={i} className="text-sm border-l-2 border-fuchsia-600 pl-3"><p className="text-fuchsia-400 font-bold uppercase text-xs">{h.eventType}</p><p className="text-slate-300">{h.details}</p><p className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleString()}</p></div>)).reverse()}</div></div>)} */}
                    {activeFormTab === "history" && (<div> <SectionHeader icon={Clock} title="Lead History" /> {!initialData?.leadHistory?.length ? (<p className="text-sm text-slate-400">No history available</p>) : (<div className="space-y-4">{[...initialData.leadHistory].reverse().map((h, i) => (<div key={i} className="border-l-2 border-fuchsia-600 pl-4 py-2 bg-slate-900/40 rounded-md" > <p className="text-xs uppercase text-fuchsia-400 font-bold">    {h.eventType} </p> <p className="text-sm text-slate-200 mt-1">{h.details} </p> <p className="text-[11px] text-slate-500 mt-1"> {new Date(h.timestamp).toLocaleString()}</p></div>))}</div>)} </div>)}
                </form></div>
                <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>{isViewMode ? 'Close' : 'Cancel'}</Button>{!isViewMode && <Button type="submit" onClick={(e) => { handleSubmit(e) }} disabled={isSubmitting}>{isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button>}</DialogFooter>

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
    const [activeTab, setActiveTab] = useState('all');
    const [selectedLead, setSelectedLead] = useState(null);
    const [dialogMode, setDialogMode] = useState('create');
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [leadToAssign, setLeadToAssign] = useState(null);
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);
    const [notesLead, setNotesLead] = useState(null);
    const [noteText, setNoteText] = useState('');
    const piopiyRef = useRef(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewData, setViewData] = useState({});
    const [isDialerLoggedIn, setIsDialerLoggedIn] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { getPermissionsByPath, user } = useAuth();
    const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false });

    useEffect(() => {
        if (!piopiyRef.current) {
            piopiyRef.current = new PIOPIY({ name: 'Eethal CRM Agent', debug: true, autoplay: true, ringTime: 60 });
            const sdk = piopiyRef.current;
            sdk.on('login', () => setIsDialerLoggedIn(true));
            sdk.on('loginFailed', (res) => { if (res && (res.code == 200 || res.msg === "User loged in successfully")) setIsDialerLoggedIn(true); });
            sdk.on('error', (err) => console.error('❌ SDK Error:', err));
            setTimeout(() => { if (piopiyRef.current && !isDialerLoggedIn) piopiyRef.current.login(CREDENTIALS.userId, CREDENTIALS.password, CREDENTIALS.sbcUrl); }, 800);
        }
        return () => { if (piopiyRef.current) { piopiyRef.current.logout(); piopiyRef.current = null; } };
    }, []);

    const fetchLeads = async (search = '') => {
        setLoading(true);
        try {
            const res = await fetch(config.Api + "Lead/getAllLeads", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 1, limit: 100, search }) });
            const data = await res.json(); if (data.success) setLeads(data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        getPermissionsByPath(window.location.pathname).then(res => { if (res) { setPermissions(res); fetchLeads(); } else navigate('/dashboard'); });
    }, []);

    const handleSaveNote = async () => {
        const res = await fetch(config.Api + "Lead/addLeadNote", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: notesLead._id, details: noteText, employeeId: user?.id }) });
        if ((await res.json()).success) { fetchLeads(); setNotesDialogOpen(false); setNoteText(''); }
    };

    const getFilteredLeads = () => leads.filter(l => {
        const status = (l.leadStatusId?.leadStatustName || l.leadStatusId?.name || '').toLowerCase();
        if (activeTab === 'new') return status === 'new';
        if (activeTab === 'followups') return status.includes('follow');
        if (activeTab === 'visits') return status.includes('visit') || status.includes('scheduled');
        if (activeTab === 'unassigned') return !l.leadAssignedId;
        return true;
    });

    const TabButton = ({ id, label, icon: Icon }) => (
        <button onClick={() => setActiveTab(id)} className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md ${activeTab === id ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
            {Icon && <Icon className="w-4 h-4" />}{label}
            {activeTab === id && <motion.div layoutId="activeTabLead" className="absolute inset-0 rounded-md bg-fuchsia-600 -z-10" />}
        </button>
    );

    // ------------------- VIEW -------------------
    const handleViewClick = (row) => {
        setViewData({
            "Lead Name": row.leadFirstName,
            "Lead Site": row.leadSiteId?.sitename || '-',
            "Lead Phone": row.leadPhone,
            "Lead AlterPhone": row.leadAltPhone,
            "Lead Status": row.leadStatusId.leadStatustName,
            "Assigned To": row.leadAssignedId ? row.leadAssignedId.EmployeeName : '',

        });
        setViewOpen(true);
    };



    const exportLeadsToExcel = () => {
        if (!leads || leads.length === 0) {
            toast({ title: "No data to export", variant: "destructive" });
            return;
        }

        // 👉 Prepare Excel rows
        const excelData = getFilteredLeads().map((l, index) => ({
            "S.No": index + 1,
            "First Name": l.leadFirstName || "",
            "Last Name": l.leadLastName || "",
            "Phone": l.leadPhone || "",
            "Email": l.leadEmail || "",
            "Site": l.leadSiteId?.sitename || "",
            "Status": l.leadStatusId?.leadStatustName || "",
            "Assigned To": l.leadAssignedId?.EmployeeName || "Unassigned",
            "Created Date": l.createdAt
                ? new Date(l.createdAt).toLocaleString("en-IN")
                : ""
        }));

        // 👉 Create worksheet & workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

        // 👉 Auto column width
        const colWidths = Object.keys(excelData[0]).map(key => ({
            wch: Math.max(
                key.length,
                ...excelData.map(row => String(row[key] || "").length)
            ) + 2
        }));
        worksheet["!cols"] = colWidths;

        // 👉 Download file
        XLSX.writeFile(workbook, `Leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };


    return (

        <div className="space-y-6 bg-slate-950 min-h-screen p-4 mt-3 text-slate-100">
            <div className="sticky top-0 z-30 bg-slate-950 pb-4 space-y-10">
                <div className="flex md:flex-row flex-col items-start md:justify-between gap-3 sticky ">
                    <h1 className="text-3xl font-bold text-white">Leads</h1>
                    <div className="grid md:grid-cols-2 grid-cols-2 gap-3">
                        {/* <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><Upload className="w-4 h-4 mr-2" />Import</Button> */}
                        {/* <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><Download className="w-4 h-4 mr-2" />Export</Button> */}

                        {["Admin", "superadmin"].includes(localStorage.getItem("role")) && (
                            <Button
                                variant="outline"
                                onClick={exportLeadsToExcel}
                                className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
                            >
                                <ArrowUpFromLine  className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        )}

                        {Permissions.isAdd && <Button onClick={() => { setDialogMode('create'); setSelectedLead(null); setDialogOpen(true); }} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold border-0"><Plus className="w-4 h-4 mr-2" />Add Lead</Button>}
                        {/* MOBILE SELECT */}
                        <div className="md:hidden w-full">
                            <select
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className=" w-full h-11 rounded-md bg-slate-900 border border-slate-700 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" >
                                <option value="all">All Leads</option>
                                <option value="new">New Leads</option>
                                <option value="followups">Follow-ups</option>
                                <option value="visits">Visits</option>
                                <option value="unassigned">Unassigned</option>
                            </select>
                        </div>
                    </div>

                </div>


                <div className="hidden md:flex md:flex-row  items-start justify-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800  ">
                    <TabButton id="all" label="All Leads" icon={Users} />
                    <TabButton id="new" label="New Leads" icon={Plus} />
                    <TabButton id="followups" label="Follow-ups" icon={PhoneCall} />
                    <TabButton id="visits" label="Visits" icon={MapPin} />
                    <TabButton id="unassigned" label="Unassigned" icon={UserMinus} />
                </div>
            </div>




            <Card className='md:block hidden'>
                <CardContent className="p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" /><Input placeholder="Search leads by name, email or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white" /></div>
                        <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"><Filter className="w-4 h-4 mr-2" />Filter</Button>
                    </div>
                    <div className="overflow-x-auto"><table className="w-full text-left">
                        <thead><tr className="border-b border-slate-700 text-white"><th className="py-3 px-4">Name</th><th className="py-3 px-4">Site</th><th className="py-3 px-4">Phone</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Assigned To</th><th className="py-3 px-4">Actions</th></tr></thead>
                        <tbody>{getFilteredLeads().map(l => (
                            <tr key={l._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                                <td className="py-3 px-4 font-medium text-white cursor-pointer" onClick={() => { setNotesLead(l); setNoteText(''); setNotesDialogOpen(true); }}><span className="underline-offset-4 group-hover:underline text-fuchsia-400">{l.leadFirstName} {l.leadLastName}</span></td>
                                <td className="py-3 px-4 text-slate-300">{l.leadSiteId?.sitename || 'N/A'}</td>
                                <td className="py-3 px-4 text-slate-300 flex gap-2"><button onClick={() => { setCallNumber(l.leadPhone); setCallDialogOpen(true); }}><Phone size={18} className=' hover:text-fuchsia-400' /></button>{l.leadPhone}</td>
                                <td className="py-3 px-4"><Badge className={statusColors[l.leadStatusId?.leadStatusColor] || 'bg-slate-700'}>{l.leadStatusId?.leadStatustName || 'New'}</Badge></td>
                                <td className="py-3 px-4 text-slate-300">{l.leadAssignedId?.EmployeeName || 'Unassigned'}</td>
                                <td className="py-3 px-4 flex gap-2">
                                    <Button variant="icon" size="icon" onClick={() => { setLeadToAssign({ id: l._id, name: l.leadFirstName, original: l }); setAssignDialogOpen(true); }} className="text-green-400"><UserPlus className="w-4 h-4" /></Button>
                                    <Button variant="icon" size="icon" onClick={() => handleViewClick(l)} className="text-blue-400"><Eye className="w-4 h-4" /></Button>
                                    {Permissions.isEdit && <Button variant="icon" size="icon" onClick={() => { setSelectedLead(l); setDialogMode('edit'); setDialogOpen(true); }} className="text-yellow-400"><Pencil className="w-4 h-4" /></Button>}
                                </td>
                            </tr>
                        ))}</tbody>
                    </table></div>
                </CardContent>
            </Card>


            {/* mobile view card for leads */}
            <Card className='md:hidden block'>
                <CardContent className="p-6">
                    {/* MOBILE VIEW */}
                    <div className="md:hidden space-y-4">
                        {getFilteredLeads().map((l) => (
                            <Card key={l._id} className="bg-purple-900/40 border border-fuchsia-700">
                                <CardContent className="p-4 space-y-3">

                                    {/* NAME + STATUS */}
                                    <div className="flex justify-between items-center">
                                        <h3
                                            className="font-semibold text-fuchsia-400 underline-offset-4 hover:underline cursor-pointer"
                                            onClick={() => {
                                                setNotesLead(l);
                                                setNoteText('');
                                                setNotesDialogOpen(true);
                                            }}
                                        >
                                            {l.leadFirstName} {l.leadLastName}
                                        </h3>

                                        <Badge
                                            className={statusColors[l.leadStatusId?.name] || 'bg-slate-700'}
                                        >
                                            {l.leadStatusId?.leadStatustName || 'New'}
                                        </Badge>
                                    </div>

                                    {/* SITE */}
                                    <div className="text-sm text-slate-300">
                                        <span className="text-slate-400">Site:</span>{' '}
                                        {l.leadSiteId?.sitename || 'N/A'}
                                    </div>

                                    {/* PHONE */}
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <button
                                            onClick={() => {
                                                setCallNumber(l.leadPhone);
                                                setCallDialogOpen(true);
                                            }}
                                        >
                                            <Phone size={18} className="hover:text-fuchsia-400" />
                                        </button>
                                        {l.leadPhone}
                                    </div>

                                    {/* ASSIGNED */}
                                    <div className="text-sm text-slate-300">
                                        <span className="text-slate-400">Assigned:</span>{' '}
                                        {l.leadAssignedId?.EmployeeName || 'Unassigned'}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="icon"
                                            size="icon"
                                            onClick={() => {
                                                setLeadToAssign({
                                                    id: l._id,
                                                    name: l.leadFirstName,
                                                    original: l,
                                                });
                                                setAssignDialogOpen(true);
                                            }}
                                            className="text-green-400"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                        </Button>

                                        <Button variant="icon" size="icon" onClick={() => handleViewClick(l)} className="text-blue-400"><Eye className="w-4 h-4" /></Button>


                                        {Permissions.isEdit && (
                                            <Button
                                                variant="icon"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedLead(l);
                                                    setDialogMode('edit');
                                                    setDialogOpen(true);
                                                }}
                                                className="text-yellow-400"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>


            {/* View icon popup */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="sm:max-w-[450px] p-0">

                    {/* HEADER (same as Employee Details) */}
                    <DialogHeader className="!flex !flex-row !items-center !justify-between !text-left p-6 border-b border-slate-800">
                        <DialogTitle className="text-lg font-semibold text-fuchsia-500">
                            Lead Details
                        </DialogTitle>

                        <button
                            onClick={() => setViewOpen(false)}
                            className="p-1 rounded text-fuchsia-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X size={20} />
                        </button>
                    </DialogHeader>


                    {/* BODY */}
                    <div className="p-6 space-y-3">
                        {Object.entries(viewData).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex justify-between items-center border-b border-slate-800 pb-2"
                            >
                                <span className="text-slate-400 text-sm">
                                    {key}
                                </span>
                                <span className="text-white text-sm font-semibold text-right">
                                    {value || '—'}
                                </span>
                            </div>
                        ))}
                    </div>

                </DialogContent>
            </Dialog>

            <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchLeads} initialData={selectedLead} mode={dialogMode} />
            <AssignDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} lead={leadToAssign} onSuccess={fetchLeads} />
            <CallDialog open={callDialogOpen} onOpenChange={setCallDialogOpen} number={callNumber} piopiyInstance={piopiyRef.current} isLoggedIn={isDialerLoggedIn} />
            <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}><DialogContent className="sm:max-w-[450px]"><DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader><div className="p-6"><Label>Notes</Label><textarea className="w-full h-28 bg-slate-900 border border-slate-700 rounded-md p-3 text-sm text-white" value={noteText} onChange={(e) => setNoteText(e.target.value)} /></div><DialogFooter><Button onClick={handleSaveNote}>Save</Button></DialogFooter></DialogContent></Dialog>
        </div>
    );
}

export default function Leads() { return (<ToastProvider><LeadsContent /></ToastProvider>); }
export { LeadDialog };