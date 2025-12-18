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
    ShieldCheck
} from "lucide-react";
import { config } from "@/components/CustomComponents/config.js";

// ------------------- REDUCER -------------------
const initialState = {
    _id: "",
    RoleCode: "",
    RoleName: "",
    description: "",
    isActive: true,
};

const RoleReducer = (state, action) => {
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
                                    <p className="text-sm opacity-90 mt-1">
                                        {t.description}
                                    </p>
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
const Dialog = ({ open, onOpenChange, children }) =>
    open ? (
        <AnimatePresence>
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
        </AnimatePresence>
    ) : null;

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

// ------------------- MAIN COMPONENT -------------------
function Rolepages() {
    const { toast } = useToast();

    const [roleBase, setRoleBase] = useState([]);
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

    const [state, dispatch] = useReducer(RoleReducer, initialState);
    const [isEdit, setIsEdit] = useState(false);
    const [viewData, setViewData] = useState({});
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // ------------------- FETCH -------------------
    useEffect(() => {
        getAllRole();
    }, []);

    const getAllRole = async () => {
        try {
            setLoading(true);
            let url = config.Api + "RoleBased/getAllRoles";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const result = await res.json();
            const data = result.data || result;

            setRoleBase(data);
            setFilteredData(data);
        } catch {
            toast({
                title: "Error",
                description: "Could not fetch roles",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // ------------------- CRUD -------------------
    const createRoleBase = async (data) => {
        let url = config.Api + "RoleBased/createRole";
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    };

    const updateRole = async (data) => {
        let url = config.Api + "RoleBased/updateRole";
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    };

    const deleteRoleBase = async (_id) => {
        let url = config.Api + "RoleBased/deleteRole";
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id }),
        });
        return await res.json();
    };


    // ------------------- PERMISSION API -------------------
    const getAllMenus = async () => {
        try {
            let url = config.Api + "RoleBased/getAllMenus";
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });
            const result = await res.json();
            return result.data || [];
        } catch (err) {
            console.error("Fetch menus failed", err);
            return [];
        }
    };

    const updateMenusAndAccess = async (roleId, menus) => {
        try {
            let url = config.Api + "RoleBased/updateMenusAndAccess";
            const payload = {
                _id: roleId,
                menus: menus
            };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            return await res.json();
        } catch (err) {
            console.error("Update access failed", err);
            throw err;
        }
    };


    // ------------------- SEARCH -------------------
    const handleSearchChange = (value) => {
        setSearchTerm(value);

        const filtered = roleBase.filter((row) =>
            Object.values(row).some(
                (v) => v && v.toString().toLowerCase().includes(value.toLowerCase())
            )
        );

        setFilteredData(filtered);
    };

    // ------------------- FORM DISPATCH -------------------
    const storeDispatch = (value, name) =>
        dispatch({ type: "text", name, value });

    // ------------------- RESET -------------------
    const clear = () => {
        setIsEdit(false);
        dispatch({ type: "reset" });
    };

    // ------------------- EDIT -------------------
    const handleEditClick = (row) => {
        setIsEdit(true);

        dispatch({ type: "text", name: "_id", value: row._id });
        dispatch({ type: "text", name: "RoleCode", value: row.RoleCode });
        dispatch({ type: "text", name: "RoleName", value: row.RoleName });
        dispatch({ type: "text", name: "description", value: row.description });
        dispatch({ type: "text", name: "isActive", value: row.isActive });

        setDialogOpen(true);
    };

    // ------------------- VIEW -------------------
    const handleViewClick = (row) => {
        setViewData({
            "Role Code": row.RoleCode,
            "Role Name": row.RoleName,
            Description: row.description || "-",
        });
        setViewOpen(true);
    };

    // ------------------- VALIDATE -------------------
    const Validate = () => {
        if (!state.RoleCode) {
            return toast({
                title: "Error",
                description: "Enter Role Code",
                variant: "destructive",
            });
        }
        if (!state.RoleName) {
            return toast({
                title: "Error",
                description: "Enter Role Name",
                variant: "destructive",
            });
        }
        triggerConfirm(isEdit ? "Update" : "Save");
    };

    // ------------------- CONFIRM -------------------
    const triggerConfirm = (type) => {
        setConfirmState({
            open: true,
            title: type === "Update" ? "Update Role?" : "Create Role?",
            description: "Are you sure?",
            action: handleSubmit,
        });
    };

    const triggerDeleteConfirm = (row) => {
        setConfirmState({
            open: true,
            title: "Delete Role?",
            description: "Are you sure?",
            action: () => handleDelete(row._id),
        });
    };

    // ------------------- SUBMIT -------------------
    const handleSubmit = async () => {
        setLoading(true);

        try {
            let payload = { ...state };

            if (isEdit) {
                // update uses _id
                await updateRole(payload);
            } else {
                // NEW ROLE  delete _id before POST
                delete payload._id;

                await createRoleBase(payload);
            }

            toast({
                title: "Success",
                description: isEdit ? "Role updated successfully" : "Role created successfully",
                variant: "success",
            });

            clear();
            setDialogOpen(false);
            getAllRole();

        } catch (err) {
            toast({
                title: "Error",
                description: "Operation failed",
                variant: "destructive",
            });

        } finally {
            setLoading(false);
            setConfirmState((prev) => ({ ...prev, open: false }));
        }
    };

    // ------------------- DELETE -------------------
    const handleDelete = async (_id) => {
        setLoading(true);
        try {
            await deleteRoleBase(_id);
            toast({
                title: "Deleted",
                description: "Role deleted",
                variant: "success",
            });
            getAllRole();
        } catch {
            toast({
                title: "Error",
                description: "Delete failed",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setConfirmState((prev) => ({ ...prev, open: false }));
        }
    };

    const PermissionDialog = ({ open, setOpen, role, onSave }) => {
        const [menus, setMenus] = useState([]);
        const [permissions, setPermissions] = useState({});
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (open && role) loadData();
        }, [open, role]);

        const loadData = async () => {
            setLoading(true);

            const allMenus = await getAllMenus();

            setMenus(allMenus);

            const mapped = {};
            (role?.permissions || []).forEach((p) => {
                mapped[p.menuId] = {
                    isView: p.isView,
                    isAdd: p.isAdd,
                    isEdit: p.isEdit,
                    isDelete: p.isDelete,
                };
            });

            setPermissions(mapped);
            setLoading(false);
        };

        const toggle = (menuId, key, value) => {
            setPermissions(prev => ({
                ...prev,
                [menuId]: {
                    ...prev[menuId],
                    [key]: value
                }
            }));
        };

        const handleSave = async () => {
            const formatted = Object.entries(permissions).map(([menuId, perm]) => ({
                menuId,
                ...perm
            }));

            await updateMenusAndAccess(role._id, formatted);
            onSave();
            setOpen(false);
        };

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="sm:max-w-[650px]"
                    title={`Permissions — ${role?.RoleName}`}
                    onClose={() => setOpen(false)}
                >
                    {loading ? (
                        <div className="text-center p-10 text-slate-400">Loading…</div>
                    ) : (
                        <div className="space-y-4">

                            {menus.map(menu => (
                                <div
                                    key={menu._id}
                                    className="border border-slate-800 bg-slate-900 p-4 rounded-lg"
                                >
                                    <p className="text-white font-semibold mb-3">{menu.label}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {["isView", "isAdd", "isEdit", "isDelete"].map((key) => (
                                            <label key={key} className="flex items-center gap-2 text-slate-300">
                                                <input
                                                    type="checkbox"
                                                    checked={permissions[menu._id]?.[key] || false}
                                                    onChange={(e) =>
                                                        toggle(menu._id, key, e.target.checked)
                                                    }
                                                />
                                                {key}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };


    // ------------------- RENDER -------------------
    return (
        <div className="space-y-6 bg-slate-950 min-h-screen p-4 text-slate-100">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Role</h1>
                <Button
                    onClick={() => {
                        clear();
                        setDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Role
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
                            <Input
                                placeholder="Search Role..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => getAllRole()}
                            className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                            />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3   gap-6">
                        {loading && filteredData.length === 0 ? (
                            <div className="text-center py-8">
                                <Loader2 className="animate-spin inline mr-2" /> Loading...
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-8">No Role found.</div>
                        ) : (
                            filteredData.map((row, index) => (
                                <motion.div
                                    key={row._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-slate-800 rounded-lg p-4 
                                                  bg-slate-900/60 hover:bg-slate-900 
                                                    backdrop-blur-md shadow-lg hover:shadow-xl
                                                      
                                                      flex flex-col gap-3 md:w-[260px]"
                                >
                                    {/* ROLE DETAILS */}
                                    <div className="">
                                        <p className="text-lg font-semibold text-white">{row.RoleName}</p>
                                        <p className="text-xs text-gray-400 mt-1">{row.RoleCode}</p>
                                    </div>

                                    {/* PERMISSION ACCESS BUTTON */}
                                    <Button
                                        className="w-full py-1 text-xs font-semibold bg-purple-700/40 
                                           hover:bg-purple-700/60 hover:text-white transition-all"
                                        onClick={() => {
                                            setSelectedRole(row);
                                            setPermissionOpen(true);
                                        }}
                                    >
                                        Permission Access
                                    </Button>

                                    {/* ACTION BUTTONS */}
                                    <div className="flex items-center justify-between  mt-2">

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
                    title={isEdit ? "Edit Role" : "Add Role"}
                    onClose={() => setDialogOpen(false)}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Role Code *</Label>
                                <Input
                                    value={state.RoleCode}
                                    onChange={(e) =>
                                        storeDispatch(e.target.value, "RoleCode")
                                    }
                                />
                            </div>

                            <div>
                                <Label>Role Name *</Label>
                                <Input
                                    value={state.RoleName}
                                    onChange={(e) =>
                                        storeDispatch(e.target.value, "RoleName")
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Active</Label>
                            <input
                                type="checkbox"
                                checked={state.isActive}
                                onChange={(e) =>
                                    storeDispatch(e.target.checked, "isActive")
                                }
                                className="h-4 w-4"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={state.description}
                                onChange={(e) =>
                                    storeDispatch(e.target.value, "description")
                                }
                            />
                        </div>

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
                    title="Role Details"
                    onClose={() => setViewOpen(false)}
                >
                    <div className="space-y-2">
                        {Object.entries(viewData).map(([k, v]) => (
                            <div
                                key={k}
                                className="flex justify-between border-b border-slate-800 pb-2"
                            >
                                <span className="text-slate-400 text-sm">{k}</span>
                                <span className="text-white text-sm font-semibold">
                                    {v}
                                </span>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* CONFIRM */}
            <Dialog
                open={confirmState.open}
                onOpenChange={() =>
                    setConfirmState((prev) => ({ ...prev, open: false }))
                }
            >
                <motion.div className="relative z-50 w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg p-6">
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
                                setConfirmState((prev) => ({ ...prev, open: false }))
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
            <div>
                <PermissionDialog
                    open={permissionOpen}
                    setOpen={setPermissionOpen}
                    role={selectedRole}
                    onSave={() => {
                        toast({
                            title: "Permissions Updated",
                            description: "Role permissions saved successfully",
                            variant: "success"
                        });
                        getAllRole();
                    }}
                />
            </div>
        </div>


    );

}

// ------------------- EXPORT -------------------
export default function Rolepage() {
    return (

        <ToastProvider>
            <Rolepages />
        </ToastProvider>
    );
}
