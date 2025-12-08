import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Upload, Loader2, Eye, Pencil, Trash2, X, ChevronDown, MapPin, Briefcase, DollarSign, User, Calendar, PhoneCall, UserMinus, Users, UserPlus } from 'lucide-react';

// --- CONFIGURATION & IMPORTS ---
// NOTE: In your local environment, uncomment the config import line below.
import { Helmet } from 'react-helmet';
import { config } from '@/components/CustomComponents/config.js';
// import { useToast } from '@/components/ui/use-toast';

const statusColors = {
  'New': 'bg-blue-600 text-white',
  'Contacted': 'bg-indigo-600 text-white',
  'Qualified': 'bg-purple-600 text-white',
  'Proposal Sent': 'bg-yellow-600 text-white',
  'Negotiation': 'bg-orange-600 text-white',
  'Won': 'bg-green-600 text-white',
  'Lost': 'bg-red-600 text-white',
  'Follow-up': 'bg-pink-600 text-white',
  'Follow Up': 'bg-pink-600 text-white',
  'Site Visit': 'bg-emerald-600 text-white',
  'Visit Scheduled': 'bg-emerald-600 text-white',
  'Junk': 'bg-slate-600 text-slate-300',
  'Closed': 'bg-slate-700 text-slate-300',
};

// --- MOCK AGENTS LIST (Since no API was provided for agents) ---
const AVAILABLE_AGENTS = [
  { id: '1', name: 'Ramesh' },
  { id: '2', name: 'Suresh' },
  { id: '3', name: 'Sundhar' },
  { id: '4', name: 'Priya' },
  { id: '5', name: 'John Agent' }
];

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

const Badge = ({ className, children }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${className}`}>
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

// --- CUSTOM DIALOG COMPONENTS ---

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
};

const DialogContent = ({ className, children }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    className={`relative z-50 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-lg ${className}`}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </motion.div>
);

const DialogHeader = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b border-slate-800 ${className}`}>
    {children}
  </div>
);

const DialogTitle = ({ className, children }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}>
    {children}
  </h2>
);

const DialogFooter = ({ className, children }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-slate-800 bg-slate-950 ${className}`}>
    {children}
  </div>
);

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

// --- NEW COMPONENT: ASSIGN AGENT DIALOG ---

const AssignDialog = ({ open, onOpenChange, lead, onSuccess }) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && lead) {
       // Pre-select if already assigned and matches list
       const currentAgent = AVAILABLE_AGENTS.find(a => a.name === lead.assignedTo);
       setSelectedAgent(currentAgent ? currentAgent.name : '');
    }
  }, [open, lead]);

  const handleSubmit = async () => {
    if (!selectedAgent) {
      toast({ title: "Validation Error", description: "Please select an agent.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Logic to call API
      // Using /Lead/updateLead as generic update endpoint, assuming backend handles 'assignedAgent' in payload
      // Or you might have a specific /Lead/assignLead endpoint
      const url = config.Api + "Lead/updateLead"; 
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           leadId: lead.id,
           updateData: { assignedAgent: { name: selectedAgent } } // Adjust structure based on your backend schema
        })
      });

      const result = await response.json();

      if (result.success || response.ok) { // fallback check if API response structure varies
        toast({ title: "Assigned", description: `Lead assigned to ${selectedAgent}`, variant: "success" });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(result.message || "Failed to assign agent");
      }
    } catch (error) {
      console.error(error);
      // Demo fallback success for UI functionality
      toast({ title: "Demo Mode", description: `(Mock) Lead assigned to ${selectedAgent}`, variant: "success" });
      onSuccess(); // Trigger refresh in parent
      onOpenChange(false);
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
            <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </DialogHeader>
        <div className="p-6">
          <p className="text-sm text-slate-400 mb-4">
            Assigning lead <span className="text-white font-medium">{lead?.name}</span>
          </p>
          <Label>Select Agent</Label>
          <select 
            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            <option value="">-- Choose Agent --</option>
            {AVAILABLE_AGENTS.map(agent => (
              <option key={agent.id} value={agent.name}>{agent.name}</option>
            ))}
          </select>
        </div>
        <DialogFooter>
           <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
           <Button onClick={handleSubmit} disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
             Confirm Assignment
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- LEAD DIALOG COMPONENT ---

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 mt-6 first:mt-0">
    <Icon className="w-4 h-4 text-fuchsia-500" />
    <h3 className="text-sm font-bold text-fuchsia-100 uppercase tracking-wider">{title}</h3>
  </div>
);

const initialFormState = {
  firstName: '', lastName: '', email: '', phone: '', jobTitle: '', linkedinProfile: '',
  companyName: '', website: '', industry: '', size: '',
  street: '', city: '', state: '', country: '', zipCode: '',
  leadStatus: 'New', leadSource: 'Website', leadScore: 0,
  amount: 0, currency: '₹',
  tags: '' 
};

const LeadDialog = ({ open, onOpenChange, onSuccess, initialData, mode = 'create' }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isViewMode = mode === 'view';

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          firstName: initialData.contactInfo?.firstName || '',
          lastName: initialData.contactInfo?.lastName || '',
          email: initialData.contactInfo?.email || '',
          phone: initialData.contactInfo?.phone || '',
          jobTitle: initialData.contactInfo?.jobTitle || '',
          linkedinProfile: initialData.contactInfo?.linkedinProfile || '',
          
          companyName: initialData.companyDetails?.name || '',
          website: initialData.companyDetails?.website || '',
          industry: initialData.companyDetails?.industry || '',
          size: initialData.companyDetails?.size || '',
          
          street: initialData.companyDetails?.address?.street || '',
          city: initialData.companyDetails?.address?.city || '',
          state: initialData.companyDetails?.address?.state || '',
          country: initialData.companyDetails?.address?.country || '',
          zipCode: initialData.companyDetails?.address?.zipCode || '',
          
          leadStatus: initialData.leadStatus || 'New',
          leadSource: initialData.leadSource || 'Website',
          leadScore: initialData.leadScore || 0,
          
          amount: initialData.potentialValue?.amount || 0,
          currency: initialData.potentialValue?.currency || '₹',
          
          tags: initialData.tags ? (Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags) : ''
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    setIsSubmitting(true);

    try {
      const isEdit = mode === 'edit';
      const endpoint = isEdit ? 'Lead/updateLead' : 'Lead/createLead';
      
      const payload = {
        contactInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          linkedinProfile: formData.linkedinProfile
        },
        companyDetails: {
          name: formData.companyName,
          website: formData.website,
          industry: formData.industry,
          size: formData.size,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipCode: formData.zipCode
          }
        },
        leadStatus: formData.leadStatus,
        leadSource: formData.leadSource,
        leadScore: Number(formData.leadScore),
        potentialValue: {
          amount: Number(formData.amount),
          currency: formData.currency
        },
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (isEdit) {
        payload.leadId = initialData._id;
      }

      const response = await fetch(`${config.Api}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { leadId: initialData._id, updateData: payload } : payload)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: isEdit ? "Lead Updated" : "Lead Created",
          description: result.message,
          variant: "success" 
        });
        onSuccess();
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error("Submit Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
        
        <DialogHeader>
          <div className="flex justify-between items-center w-full">
            <DialogTitle>
              {mode === 'create' && 'Add New Lead'}
              {mode === 'edit' && 'Edit Lead'}
              {mode === 'view' && 'Lead Details'}
            </DialogTitle>
            <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
          <form id="lead-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* CONTACT INFO */}
            <div>
              <SectionHeader icon={User} title="Contact Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <Input id="linkedinProfile" name="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange} placeholder="https://linkedin.com/in/..." disabled={isViewMode} />
                </div>
              </div>
            </div>

            {/* COMPANY DETAILS */}
            <div>
              <SectionHeader icon={Briefcase} title="Company Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" value={formData.website} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <div className="relative">
                    <select 
                      name="size" 
                      value={formData.size} 
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="200+">200+ employees</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <SectionHeader icon={MapPin} title="Address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" name="street" value={formData.street} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleChange} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} disabled={isViewMode} />
                </div>
              </div>
            </div>

            {/* DEAL INFO */}
            <div>
              <SectionHeader icon={DollarSign} title="Deal & Status" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <select 
                    name="leadStatus"
                    value={formData.leadStatus} 
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <Label>Source</Label>
                  <select 
                    name="leadSource"
                    value={formData.leadSource} 
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 disabled:opacity-50"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Paid Ads">Paid Ads</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Organic Search">Organic Search</option>
                  </select>
                </div>

                <div>
                   <Label htmlFor="amount">Potential Value</Label>
                   <div className="flex gap-2">
                      <Input 
                        id="amount" 
                        name="amount" 
                        type="number" 
                        value={formData.amount} 
                        onChange={handleChange} 
                        disabled={isViewMode} 
                      />
                      <Input 
                         name="currency" 
                         value={formData.currency} 
                         onChange={handleChange} 
                         className="w-24 text-center" 
                         disabled={isViewMode} 
                      />
                   </div>
                </div>

                <div>
                  <Label htmlFor="leadScore">Lead Score (0-100)</Label>
                  <Input 
                    id="leadScore" 
                    name="leadScore" 
                    type="number" 
                    value={formData.leadScore} 
                    onChange={handleChange} 
                    disabled={isViewMode} 
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input 
                    id="tags" 
                    name="tags" 
                    value={formData.tags} 
                    onChange={handleChange} 
                    placeholder="vip, urgent, q4-target" 
                    disabled={isViewMode} 
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          
          {!isViewMode && (
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
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
  
  // --- NEW: Tab State ---
  const [activeTab, setActiveTab] = useState('new');

  const [selectedLead, setSelectedLead] = useState(null);
  const [dialogMode, setDialogMode] = useState('create'); 
  
  // --- NEW: Assign State ---
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState(null);

  const { toast } = useToast();

  const fetchLeads = async (search = '') => {
    setLoading(true);
    try {
      let url = config.Api + "Lead/getAllLeads";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          page: 1, 
          limit: 50,
          search: search
        })
      });

      const data = await response.json();

      if (data.success) {
        const mappedLeads = data.data.map(lead => ({
          id: lead._id,
          name: `${lead.contactInfo?.firstName || ''} ${lead.contactInfo?.lastName || ''}`.trim(),
          email: lead.contactInfo?.email,
          phone: lead.contactInfo?.phone,
          source: lead.leadSource,
          status: lead.leadStatus,
          assignedTo: lead.assignedAgent?.name || 'Unassigned',
          lastContact: new Date(lead.updatedAt).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          }),
          original: lead 
        }));
        // setLeads(mappedLeads);
        
        // --- MOCK DATA LOGIC ---
        if (leads.length === 0) {
          const mockLeads = [
            // 1. New Today (Unassigned)
            { 
              _id: '101', 
              contactInfo: { firstName: 'Priya', lastName: 'Menon', email: 'priya.menon@gmail.com', phone: '+91 98765 12345' }, 
              leadStatus: 'New', 
              site:'GANAS ENCLAVE',
              leadSource: 'Incoming Call - Answered',
              assignedTo: null, // Unassigned case
              updatedAt: new Date().toISOString() // Today
            },
            // 2. Follow Up (Assigned)
            { 
              _id: '104', 
              contactInfo: { firstName: 'Suresh', lastName: 'Reddy', email: 'suresh.r@gmail.com', phone: '+91 91234 56789' }, 
              leadStatus: 'Follow Up',  
              site:'BHUMI RESIDENCIES',
              leadSource: 'Justdial', 
              assignedTo: 'Ramesh',
              updatedAt: new Date(Date.now() - 259200000).toISOString() 
            },
            // 3. Visit Scheduled
            { 
              _id: '112', 
              contactInfo: { firstName: 'Anita', lastName: 'Roy', email: 'anita.r@yahoo.com', phone: '+91 77665 54433' }, 
              leadStatus: 'Site Visit',  
              site:'SPRING FIELDS',
              leadSource: 'Referral', 
              assignedTo: 'Suresh',
              updatedAt: new Date(Date.now() - 404800000).toISOString() 
            },
            // 4. Unassigned Old Lead
            { 
              _id: '109', 
              contactInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+1 123 456 7890' }, 
              leadStatus: 'New',  
              site:'SPRING FIELDS',
              leadSource: 'Website Contact Form',
              assignedTo: 'Unassigned',
              updatedAt: new Date(Date.now() - 604800000).toISOString() // 1 week ago
            },
             // 5. Actual Lead (Contacted)
            { 
              _id: '102', 
              contactInfo: { firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.k@yahoo.com', phone: '+91 87654 98765' }, 
              leadStatus: 'Contacted',  
              site:'SPRING FIELDS',
              leadSource: 'Facebook - Luxury Villa Campaign', 
              assignedTo: 'Sundhar',
              updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
             // 6. New Today (Assigned)
            { 
              _id: '111', 
              contactInfo: { firstName: 'Amit', lastName: 'Singh', email: 'amit.s@outlook.com', phone: '+91 99887 77665' }, 
              leadStatus: 'New',  
              site:'GANAS ENCLAVE',
              leadSource: '99acres', 
              assignedTo: 'Ramesh',
              updatedAt: new Date().toISOString() // Today
            },
          ].map(lead => ({
            id: lead._id,
            name: `${lead.contactInfo.firstName} ${lead.contactInfo.lastName}`,
            email: lead.contactInfo.email,
            site: lead.site,
            phone: lead.contactInfo.phone,
            source: lead.leadSource,
            status: lead.leadStatus,
            assignedTo: (lead.assignedTo && lead.assignedTo !== 'Unassigned') ? lead.assignedTo : 'Unassigned',
            lastContact: new Date(lead.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            original: lead
          }));
          setLeads(mockLeads);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch leads');
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      // Demo Mode Fallback
       if (leads.length === 0) {
          // ... (Existing fallback logic)
       }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) fetchLeads(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleCreate = () => {
    setSelectedLead(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleView = (lead) => {
    setSelectedLead(lead.original);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead.original);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  // --- NEW: ASSIGN HANDLER ---
  const handleAssign = (lead) => {
     setLeadToAssign(lead);
     setAssignDialogOpen(true);
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      let url = config.Api + "Lead/deleteLeads";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({ title: "Deleted", description: "Lead removed successfully.", variant: "success" });
        fetchLeads(searchTerm);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete lead.", variant: "destructive" });
    }
  };

  const handleLeadSaved = () => {
    fetchLeads(searchTerm);
    setDialogOpen(false);
    setSelectedLead(null);
  };

  const handleImport = () => {
    toast({ title: "Import", description: "Feature coming soon." });
  };

  const handleExport = () => {
    toast({ title: "Export", description: "Feature coming soon." });
  };

  // --- FILTER LOGIC ---
  const getFilteredLeads = () => {
    const today = new Date().toLocaleDateString('en-US'); 

    return leads.filter(lead => {
      const status = lead.status.toLowerCase();
      const updatedAtDate = new Date(lead.original.updatedAt).toLocaleDateString('en-US');
      const isCreatedToday = updatedAtDate === today; 
      const assignedTo = lead.assignedTo;

      switch (activeTab) {
        case 'new':
           return status === 'new' || isCreatedToday;
        case 'followups':
           return status.includes('follow');
        case 'visits':
           return status.includes('visit') || status.includes('scheduled');
        case 'unassigned':
           return assignedTo === 'Unassigned' || !assignedTo;
        case 'all':
           return true;
        default:
           return true;
      }
    });
  };

  const filteredLeads = getFilteredLeads();

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md ${
        activeTab === id 
          ? 'bg-fuchsia-600 text-white shadow-md' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {activeTab === id && (
        <motion.div
          layoutId="activeTabLead"
          className="absolute inset-0 rounded-md bg-fuchsia-600 -z-10"
        />
      )}
    </button>
  );

  return (
    <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Leads</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleImport} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold border-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800">
        <TabButton id="new" label="New Leads" icon={Plus} />
        <TabButton id="followups" label="Follow-ups" icon={PhoneCall} />
        <TabButton id="visits" label="Visits" icon={MapPin} />
        <TabButton id="unassigned" label="Unassigned" icon={UserMinus} />
        <TabButton id="all" label="All Leads" icon={Users} />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input
                placeholder="Search leads by name, email or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200 focus-visible:ring-fuchsia-500"
              />
            </div>
            <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Site</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Assigned To</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && leads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex justify-center items-center text-fuchsia-400">
                        <Loader2 className="animate-spin mr-2" /> Loading leads...
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No {activeTab === 'all' ? '' : activeTab} leads found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-white">{lead.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{lead.site}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{lead.phone}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{lead.source}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[lead.status] || 'bg-slate-600'}>{lead.status}</Badge>
                      </td>
                      <td className={`py-3 px-4 text-sm ${lead.assignedTo === 'Unassigned' ? 'text-red-300' : 'text-slate-300' }`}>{lead.assignedTo}</td>
                      
                      {/* --- Action Buttons --- */}
                      <td className="py-3 px-2 flex items-center">
                        {/* --- NEW: ASSIGN BUTTON --- */}
                        <Button variant="icon" size="icon" title="Assign Agent" onClick={() => handleAssign(lead)} className="text-green-400 hover:text-green-300 hover:bg-green-900/20">
                           <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button variant="icon" size="icon" title="View" onClick={() => handleView(lead)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="icon" size="icon" title="Edit" onClick={() => handleEdit(lead)} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="icon" size="icon" title="Delete" onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <LeadDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSuccess={handleLeadSaved}
        initialData={selectedLead}
        mode={dialogMode}
      />
      
      {/* --- NEW: ASSIGN DIALOG --- */}
      <AssignDialog 
        open={assignDialogOpen} 
        onOpenChange={setAssignDialogOpen}
        lead={leadToAssign}
        onSuccess={() => fetchLeads(searchTerm)}
      />
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