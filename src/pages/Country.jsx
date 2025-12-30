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
} from "lucide-react";
import { config } from "@/components/CustomComponents/config.js";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";

// ------------------- REDUCER -------------------
const initialState = {
    CountryCode: '',
    CountryName: '',
    StateID: '',
    isActive: true
};

const CountryReducer = (state, action) => {
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
function Country() {
    const { toast } = useToast();
    const navigate = useNavigate()
    const [country, setCountry] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [states, setStates] = useState([])

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

    const [state, dispatch] = useReducer(CountryReducer, initialState);
    const [isEdit, setIsEdit] = useState(false);
    const [viewData, setViewData] = useState({});

    const { getPermissionsByPath, user } = useAuth();
    const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false });

    // ------------------- FETCH EMPLOYEES -------------------
    useEffect(() => {
        // getAllCountry();
        getAllState()

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
            getAllCountry()
        }
    }, [Permissions])

    const getAllState = async () => {
        try {
            setLoading(true);
            let url = config.Api + "Country/getAllStates";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const result = await res.json();
            const data = result.data || result;

            setStates(data);

        } catch (err) {
            toast({
                title: "Error",
                description: "Could not fetch Country",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };




    const getAllCountry = async () => {
        try {
            setLoading(true);
            let url = config.Api + "Country/getAllCountry";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const result = await res.json();
            const data = result.data || result;

            setCountry(data);
            setFilteredData(data);
        } catch (err) {
            toast({
                title: "Error",
                description: "Could not fetch Country",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };


    // ------------------- CRUD APIs -------------------
    const createCountry = async (data) => {
        let url = config.Api + "Country/createCountry";
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    };

    const updateCountry = async (data) => {
        let url = config.Api + "Country/updateCountry";
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    };

    const deleteCountry = async (_id) => {
        let url = config.Api + "Country/deleteCountry";
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

        const filtered = country.filter((row) =>
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
        // const roleValue =
        //     row.roleId
        //         ? (typeof row.roleId === "object" ? row.roleId._id : row.roleId)
        //         : "";

        // dispatch({ type: "text", name: "roleId", value: roleValue });

        setDialogOpen(true);
    };

    // ------------------- VIEW -------------------
    const handleViewClick = (row) => {
        setViewData({
            "Country Code": row.CountryCode,
            "Country Name": row.CountryName,

        });
        setViewOpen(true);
    };

    // ------------------- VALIDATE -------------------
    const Validate = () => {
        if (!state.CountryCode) {
            toast({
                title: "Error",
                description: "Enter Country Code",
                variant: "destructive",
            });
            return;
        }
        if (!state.CountryName) {
            toast({
                title: "Error",
                description: "Enter Country Name",
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
            title: type === "Update" ? "Update Country?" : "Create Country?",
            description: `Are you sure?`,
            action: handleSubmit,
        });
    };

    const triggerDeleteConfirm = (row) => {
        setConfirmState({
            open: true,
            title: "Delete Country?",
            description: "Are you sure?",
            action: () => handleDelete(row._id),
        });
    };

    // ------------------- SUBMIT -------------------
    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (isEdit) {
                await updateCountry(state);
                toast({
                    title: "Success",
                    description: "Country updated successfully",
                    variant: "success",
                });
            } else {
                await createCountry(state);
                toast({
                    title: "Success",
                    description: "Country created successfully",
                    variant: "success",
                });
            }
            clear();
            setDialogOpen(false);
            getAllCountry();
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
            await deleteCountry(_id);
            toast({
                title: "Deleted",
                description: "Country deleted",
                variant: "success",
            });
            getAllCountry();
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
            <div className="flex  items-start space-y-3 flex-col md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-white">Country</h1>

                {
                    Permissions.isAdd &&
                    <Button
                        onClick={() => {
                            clear();
                            setDialogOpen(true);
                        }}
                        className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Country
                    </Button>
                }



            </div>

            {/* TABLE */}
            <Card className={`hidden md:block`}>
                <CardContent className="p-6">
                    {/* SEARCH */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
                            <Input
                                placeholder="Search Country Name..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => getAllCountry()}
                            className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>

                    {/* TABLE BODY */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-3 px-4 text-left">Country Code</th>
                                    <th className="py-3 px-4 text-left">Country Name</th>
                                    <th className="py-3 px-4 text-left">State Name</th>
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
                                            No Country found.
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
                                            <td className="py-3 px-4">{row.CountryCode}</td>
                                            <td className="py-3 px-4">{row.CountryName}</td>
                                            <td className="py-3 px-4">{row.StateName}</td>


                                            <td className="py-3 px-4 flex gap-2">
                                                <Button
                                                    variant="icon"
                                                    size="icon"
                                                    onClick={() => handleViewClick(row)}
                                                >
                                                    <Eye className="w-4 h-4 text-blue-400" />
                                                </Button>
                                                {
                                                    Permissions.isEdit &&
                                                    <Button
                                                        variant="icon"
                                                        size="icon"
                                                        onClick={() => handleEditClick(row)}
                                                    >
                                                        <Pencil className="w-4 h-4 text-yellow-400" />
                                                    </Button>
                                                }

                                                {
                                                    Permissions.isDelete &&
                                                    <Button
                                                        variant="icon"
                                                        size="icon"
                                                        onClick={() => triggerDeleteConfirm(row)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </Button>
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

            {/* mobile view card */}
            <Card className={`md:hidden`}>
                <CardContent className="p-6">
                    {/* SEARCH */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
                            <Input
                                placeholder="Search Country Name..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => getAllCountry()}
                            className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="md:hidden space-y-4">
                        {loading && filteredData.length === 0 ? (
                            <div className="text-center py-8 text-fuchsia-400">
                                <Loader2 className="animate-spin inline mr-2" /> Loading...
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                No Country found.
                            </div>
                        ) : (
                            filteredData.map((row, index) => (
                                <motion.div
                                    key={row._id || index}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="  backdrop-blur-lg shadow-md">

                                        {/* TOP ACCENT */}
                                        {/* <div className="h-1 w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500" /> */}

                                        <CardContent className="p-4 space-y-3">

                                            {/* HEADER */}
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs text-fuchsia-300 uppercase tracking-wide">
                                                        Country
                                                    </p>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {row.CountryName}
                                                    </h3>
                                                </div>

                                                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700">
                                                    {row.CountryCode}
                                                </span>
                                            </div>

                                            {/* DETAILS */}
                                            <div className="space-y-1 text-sm text-slate-300">
                                                <p className="text-xs text-slate-400">State</p>
                                                <p className="font-medium text-white">
                                                    {row.StateName}
                                                </p>
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
                                                {
                                                    Permissions.isEdit &&
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:bg-yellow-500/20"
                                                        onClick={() => handleEditClick(row)}
                                                    >
                                                        <Pencil className="w-4 h-4 text-yellow-400" />
                                                    </Button>
                                                }

                                                {
                                                    Permissions.isDelete &&
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:bg-red-500/20"
                                                        onClick={() => triggerDeleteConfirm(row)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </Button>
                                                }

                                            </div>

                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>

                </CardContent>
            </Card>

            {/* ADD/EDIT DIALOG */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent
                    className="sm:max-w-[600px]"
                    title={isEdit ? "Edit Country" : "Add Country"}
                    onClose={() => setDialogOpen(false)}
                >
                    <div className="space-y-4">
                        {/* FORM */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                                <Label>Country Code *</Label>
                                <Input
                                    value={state.CountryCode}
                                    onChange={(e) =>
                                        storeDispatch(e.target.value, "CountryCode")
                                    }
                                />
                            </div>

                            <div>
                                <Label>Country Name *</Label>
                                <Input
                                    value={state.CountryName}
                                    onChange={(e) =>
                                        storeDispatch(e.target.value, "CountryName")
                                    }
                                />
                            </div>

                            <div>
                                <Label>State *</Label>

                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
                                    value={state.StateID}
                                    onChange={(e) => storeDispatch(e.target.value, "StateID")}
                                >
                                    <option value="">Select State</option>

                                    {states.map((sta) => (
                                        <option key={sta._id} value={sta._id}>
                                            {sta.StateName}
                                        </option>
                                    ))}
                                </select>
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
export default function CountryPage() {
    return (
        <ToastProvider>
            <Country />
        </ToastProvider>
    );
}
