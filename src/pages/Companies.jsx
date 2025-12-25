import React, {
  useState,
  useEffect,
  useReducer,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
  Link,
} from "lucide-react";
import { config } from "@/components/CustomComponents/config.js";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";

// ------------------- REDUCER -------------------
const initialState = {
  companyCode: '',
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAlternatePhone: '',
  companyAddress: '',
  companyCity: '',
  companyState: '',
  companyCountry: '',
  companyPincode: '',
  companyGstNumber: '',
  companyWebsite: '',
  isActive: true
};

const CompanyReducer = (state, action) => {
  switch (action.type) {
    case "text":
      return { ...state, [action.name]: action.value };
    case "reset":
      return initialState;
    default:
      return state;
  }
};

// ------------------- TOAST SYSTEM -------------------
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
              className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${t.variant === "destructive"
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
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
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

// ------------------- UI COMPONENTS -------------------
const Card = ({ className, children }) => (
  <div
    className={`rounded-lg border bg-slate-900 border-slate-800 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const Button = ({
  className,
  variant = "default",
  size = "default",
  onClick,
  disabled,
  children,
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium disabled:opacity-50";
  const variants = {
    default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-100",
    icon: "bg-transparent hover:bg-slate-800 text-slate-300",
    ghost: "hover:bg-slate-800 text-slate-100",
  };

  const sizes = {
    default: "h-10 px-4",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className, ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 ${className}`}
    {...props}
  />
);

const Textarea = ({ className, ...props }) => (
  <textarea
    className={`flex w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 min-h-[80px] ${className}`}
    {...props}
  />
);

const Label = ({ children }) => (
  <label className="text-sm font-medium text-slate-300 block mb-2">
    {children}
  </label>
);

// ------------------- DIALOG -------------------
const Dialog = ({ open, onOpenChange, children }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

const DialogContent = ({ className, title, onClose, children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    className={`relative z-50 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-lg max-h-[90vh] flex flex-col ${className}`}
  >
    <div className="flex justify-between items-center p-6 border-b border-slate-800">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <X size={20} />
      </button>
    </div>
    <div className="overflow-y-auto p-6">{children}</div>
  </motion.div>
);

// ------------------- EMPLOYEE CONTENT -------------------
function Companies() {
  const { toast } = useToast();
  const navigate = useNavigate()
  const [company, setCompany] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    description: "",
    action: null,
  });

  const [state, dispatch] = useReducer(CompanyReducer, initialState);
  const [isEdit, setIsEdit] = useState(false);
  const [viewData, setViewData] = useState({});

  // ------------------- FETCH EMPLOYEES -------------------
  useEffect(() => {
    getAllCompany();

  }, []);



  const getAllCompany = async () => {
    try {
      setLoading(true);
      let url = config.Api + "Company/getAllCompany";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await res.json();
      const data = result.data || result;

      setCompany(data);
      setFilteredData(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not fetch Company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  // ------------------- CRUD APIs -------------------
  const createCompany = async (data) => {
    let url = config.Api + "Company/createCompany";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  };

  const updateCompany = async (data) => {
    let url = config.Api + "Company/updateCompany";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  };

  const deleteCompany = async (_id) => {
    let url = config.Api + "Company/deleteCompany";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    return await res.json();
  };

  // ------------------- SEARCH -------------------
  const handleSearchChange = (value) => {
    setSearchTerm(value);

    const filtered = company.filter((row) =>
      Object.values(row).some(
        (v) =>
          v &&
          v.toString().toLowerCase().includes(value.toLowerCase())
      )
    );

    setFilteredData(filtered);
  };

  // ------------------- FORM DISPATCH -------------------
  const storeDispatch = (e, name) => {
    dispatch({ type: "text", name, value: e });
  };

  // ------------------- RESET -------------------
  const clear = () => {
    setIsEdit(false);
    dispatch({ type: "reset" });
  };

  // ------------------- EDIT -------------------
  const handleEditClick = (row) => {
    setIsEdit(true);

    Object.entries(row).forEach(([key, val]) => {
      dispatch({ type: "text", name: key, value: val });
    });
    const roleValue =
      row.roleId
        ? (typeof row.roleId === "object" ? row.roleId._id : row.roleId)
        : "";

    dispatch({ type: "text", name: "roleId", value: roleValue });

    setDialogOpen(true);
  };

  // ------------------- VIEW -------------------
  const handleViewClick = (row) => {
    setViewData({
      " Code": row.companyCode,
      " Name": row.companyName,
      " Email": row.companyEmail,
      " Phone": row.companyPhone,
      " AlternatePhone": row.companyAlternatePhone,
      " Address ": row.companyAddress,
      " City    ": row.companyCity,
      " State   ": row.companyState,
      " Country ": row.companyCountry,
      " Pincode ": row.companyPincode,
      " GstNumber": row.companyGstNumber,
      " Website ": row.companyWebsite,

    });
    setViewOpen(true);
  };

  // ------------------- VALIDATE -------------------
  const Validate = () => {
    if (!state.companyCode) {
      toast({
        title: "Error",
        description: "Enter Company Code",
        variant: "destructive",
      });
      return;
    }
    if (!state.companyName) {
      toast({
        title: "Error",
        description: "Enter Company Name",
        variant: "destructive",
      });
      return;
    }

    triggerConfirm(isEdit ? "Update" : "Save");
  };

  // ------------------- CONFIRM -------------------
  const triggerConfirm = (type) => {
    setConfirmState({
      open: true,
      title: type === "Update" ? "Update Company?" : "Create Company?",
      description: `Are you sure?`,
      action: handleSubmit,
    });
  };

  const triggerDeleteConfirm = (row) => {
    setConfirmState({
      open: true,
      title: "Delete Company?",
      description: "Are you sure?",
      action: () => handleDelete(row._id),
    });
  };

  // ------------------- SUBMIT -------------------
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateCompany(state);
        toast({
          title: "Success",
          description: "Company updated successfully",
          variant: "success",
        });
      } else {
        await createCompany(state);
        toast({
          title: "Success",
          description: "Company created successfully",
          variant: "success",
        });
      }
      clear();
      setDialogOpen(false);
      getAllCompany();
    } catch (err) {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmState({ ...confirmState, open: false });
    }
  };

  // ------------------- DELETE -------------------
  const handleDelete = async (_id) => {
    setLoading(true);
    try {
      await deleteCompany(_id);
      toast({
        title: "Deleted",
        description: "Company deleted",
        variant: "success",
      });
      getAllCompany();
    } catch (err) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmState({ ...confirmState, open: false });
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">
      {/* HEADER */}
      <div className="flex md:flex-row flex-col  items-start space-y-2 md:items-center md:justify-between">
        <h1 className="md:text-3xl text-2xl font-bold text-white">Company Details</h1>
        <Button
          onClick={() => {
            clear();
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Company
        </Button>


      </div>

      {/* TABLE */}
      <Card >
        <CardContent className="p-6">
          {/* SEARCH */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input
                placeholder="Search LeadSource Name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => getAllCompany()}
              className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* TABLE BODY */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-4 text-left">Company Name</th>
                  <th className="py-3 px-4 text-left">Company Email</th>
                  <th className="py-3 px-4 text-left">Company Phone</th>
                  <th className="py-3 px-4 text-left">Company Websit</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <Loader2 className="animate-spin inline mr-2" /> Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      No Company found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => (
                    <motion.tr
                      key={row._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                    
                      <td className="py-3 px-4">{row.companyName}</td>
                      <td className="py-3 px-4">{row.companyEmail}</td>
                      <td className="py-3 px-4">{row.companyPhone}</td>
                     <td className="py-3 px-4 hover:text-purple-600"><a href={`${row.companyWebsite}`} target="_blank">{row.companyWebsite}</a></td>
                        

                      <td className="py-3 px-4 flex gap-2">
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => handleViewClick(row)}
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </Button>

                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => handleEditClick(row)}
                        >
                          <Pencil className="w-4 h-4 text-yellow-400" />
                        </Button>

                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => triggerDeleteConfirm(row)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

                {/* MOBILE CARD VIEW */}
<div className="md:hidden space-y-4">
  {loading && filteredData.length === 0 ? (
    <div className="text-center py-8">
      <Loader2 className="animate-spin inline mr-2" /> Loading...
    </div>
  ) : filteredData.length === 0 ? (
    <div className="text-center py-8 text-slate-400">
      No Company found.
    </div>
  ) : (
    filteredData.map((row) => (
      <Card key={row._id} className="border border-slate-800 bg-slate-900">
        <CardContent className="p-4 space-y-2">
          <div>
            <p className="text-xs text-slate-400">Company Name</p>
            <p className="font-semibold text-white">{row.companyName}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm">{row.companyEmail}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Phone</p>
            <p className="text-sm">{row.companyPhone}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Website</p>
            <a
              href={
                row.companyWebsite?.startsWith("http")
                  ? row.companyWebsite
                  : `https://${row.companyWebsite}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 text-sm underline"
            >
              {row.companyWebsite}
            </a>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-3">
            <Button variant="icon" size="icon" onClick={() => handleViewClick(row)}>
              <Eye className="w-4 h-4 text-blue-400" />
            </Button>
            <Button variant="icon" size="icon" onClick={() => handleEditClick(row)}>
              <Pencil className="w-4 h-4 text-yellow-400" />
            </Button>
            <Button variant="icon" size="icon" onClick={() => triggerDeleteConfirm(row)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </CardContent>
      </Card>
    ))
  )}
</div>
          
        </CardContent>
      </Card>




    

     

       

      {/* ADD/EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-[600px]"
          title={isEdit ? "Edit Company" : "Add Company"}
          onClose={() => setDialogOpen(false)}
        >
          <div className="space-y-4">
            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Code *</Label>
                <Input
                  value={state.companyCode}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyCode")
                  }
                />
              </div>

              <div>
                <Label>Company Name *</Label>
                <Input
                  value={state.companyName}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyName")
                  }
                />
              </div>


               <div>
                <Label>Company Email *</Label>
                <Input
                  value={state.companyEmail}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyEmail")
                  }
                />
              </div>
          

               <div>
                <Label>Company phone *</Label>
                <Input
                  value={state.companyPhone}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyPhone")
                  }
                />
              </div>

               <div>
                <Label>Company AltPhone *</Label>
                <Input
                  value={state.companyAlternatePhone}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyAlternatePhone")
                  }
                />
              </div>

               <div>
                <Label>Company Address *</Label>
                <Input
                  value={state.companyAddress}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyAddress")
                  }
                />
              </div>


               <div>
                <Label>Company pincode *</Label>
                <Input
                  value={state.companyPincode}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyPincode")
                  }
                />
              </div>

                    <div>
                <Label>Company City *</Label>
                <Input
                  value={state.companyCity}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyCity")
                  }
                />
              </div>

               <div>
                <Label>Company State *</Label>
                <Input
                  value={state.companyState}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyState")
                  }
                />
              </div>


               <div>
                <Label>Company Country *</Label>
                <Input
                  value={state.companyCountry}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyCountry")
                  }
                />
              </div>



                  <div>
                <Label>Company GTS *</Label>
                <Input
                  value={state.companyGstNumber}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyGstNumber")
                  }
                />
              </div>


                <div>
                <Label>Company Website *</Label>
                <Input
                  value={state.companyWebsite}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "companyWebsite")
                  }
                />
              </div>


          

             


               




            </div>


            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>

              <Button onClick={Validate} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent
          className="sm:max-w-[450px]"
          title="Document Details"
          onClose={() => setViewOpen(false)}
        >
          <div className="space-y-2">
            {Object.entries(viewData).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between border-b border-slate-800 pb-2"
              >
                <span className="text-slate-400 text-sm">{k}</span>
                <span className="text-white text-sm font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM */}
      <Dialog
        open={confirmState.open}
        onOpenChange={() =>
          setConfirmState({ ...confirmState, open: false })
        }
      >
        <motion.div
          className="relative z-50 w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg p-6"
        >
          <div className="flex gap-4 mb-4">
            <AlertTriangle className="text-yellow-500 w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold text-white">
                {confirmState.title}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {confirmState.description}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() =>
                setConfirmState({ ...confirmState, open: false })
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={confirmState.action}
              disabled={loading}
              className="bg-fuchsia-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </motion.div>
      </Dialog>
    </div>
  );
}

// ------------------- EXPORT -------------------
export default function CompanyPage() {
  return (
    <ToastProvider>
      <Companies />
    </ToastProvider>
  );
}
