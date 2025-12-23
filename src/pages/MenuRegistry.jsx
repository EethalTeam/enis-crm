 // src/pages/MenuRegistry.jsx
import React, { useState, useEffect, useReducer, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Loader2, Edit, Trash2, X, RefreshCw, Menu as MenuIcon } from "lucide-react";
import { config } from "@/components/CustomComponents/config.js";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";

/*
  MenuRegistry.jsx
  - Uses APIs:
    POST: config.Api + "Menu/getAllMenus"
    POST: config.Api + "Menu/createMenu"
    POST: config.Api + "Menu/updateMenu"
    POST: config.Api + "Menu/deleteMenu"
  - Fields: label, id, path, icon, order, parentId, isActive
  - Self-contained toast, dialogs, inputs, basic styles (tailwind-like classes expected)
*/

/* ---------------- reducer & initial state ---------------- */
const initialState = {
  _id: "",
  label: "",
  id: "",
  path: "",
  icon: "",
  parentId: "",
  parentLabel: "",
  order: 0,
  isActive: true,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "text":
      return { ...state, [action.name]: action.value };
    case "set":
      return { ...state, ...action.payload };
    case "reset":
      return initialState;
    default:
      return state;
  }
};

/* ---------------- Toast provider ---------------- */
const ToastContext = createContext({});
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, title, description, variant }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 3000);
  };
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`pointer-events-auto p-3 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${
                t.variant === "destructive" ? "bg-red-800 text-white" :
                t.variant === "success" ? "bg-green-800 text-white" :
                "bg-slate-900 text-white"
              }`}
            >
              <div>
                {t.title && <div className="font-semibold text-sm">{t.title}</div>}
                {t.description && <div className="text-sm opacity-90 mt-1">{t.description}</div>}
              </div>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-slate-300">
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

/* ---------------- Simple UI primitives (replace with shared ones if you have) ---------------- */
const Button = ({ children, onClick, variant = "default", size = "default", className = "", disabled }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium disabled:opacity-60";
  const variants = {
    default: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    outline: "border border-slate-700 text-white hover:bg-slate-800",
    ghost: "hover:bg-slate-800 text-white",
    icon: "bg-transparent hover:bg-slate-800 text-white",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  const sizes = { default: "h-10 px-4", icon: "h-9 w-9" };
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
const Input = (props) => <input {...props} className={`h-10 w-full rounded-md px-3 border bg-slate-900 text-white ${props.className || ""}`} />;
const Label = ({ children }) => <label className="text-sm text-slate-300 block mb-1">{children}</label>;

/* ---------------- Dialog wrapper ---------------- */
const Dialog = ({ open, onOpenChange, children }) =>
  open ? (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onOpenChange(false)} className="fixed inset-0 bg-black/70" />
        {children}
      </div>
    </AnimatePresence>
  ) : null;

const DialogContent = ({ title, onClose, className, children }) => (
  <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className={`relative z-50 w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-lg shadow-lg ${className || ""}`}>
    <div className="flex justify-between items-center p-5 border-b border-slate-800">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <button onClick={onClose} className="text-slate-300"><X size={18} /></button>
    </div>
    <div className="p-5 max-h-[70vh] overflow-auto">{children}</div>
  </motion.div>
);

/* ---------------- Main Component ---------------- */
function MenuRegistryInner() {
  const { toast } = useToast();

  const [menus, setMenus] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [state, dispatch] = useReducer(formReducer, initialState);
   const { getPermissionsByPath } = useAuth();
    const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false })

  /* ---------------- Fetch all menus ---------------- */
  // useEffect(() => {
  //   fetchMenus();
  // }, []);

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
       fetchMenus();
      }
  },[Permissions])




 const fetchMenus = async () => {
  setLoading(true);
  try {
    const url = config.Api + "Menu/getAllMenus";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const result = await res.json();

    // if backend failed → stop here (NO map)
    if (!result.success || !Array.isArray(result.data)) {
      console.error("Backend error:", result);
      toast({
        title: "Error",
        description: "Menu API failed",
        variant: "destructive"
      });
      setMenus([]);
      setFiltered([]);
      return;
    }

    const data = result.data;


    // normalize
    const normalized = data.map(m => ({
      ...m,
      parentLabel: m.parentId?.label || m.parentTitle || ""  // backend sends parentTitle
    }));

    setMenus(normalized);
    setFiltered(normalized);

  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: "Could not fetch menus", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  /* ---------------- SEARCH ---------------- */
  const handleSearch = (val) => {
    setSearchTerm(val);
    if (!val) {
      setFiltered(menus);
      return;
    }
    const q = val.toLowerCase();
    const f = menus.filter(m =>
      (m.label || "").toLowerCase().includes(q) ||
      (m.id || "").toLowerCase().includes(q) ||
      (m.path || "").toLowerCase().includes(q)
    );
    setFiltered(f);
  };

  /* ---------------- Parent menu list (top-level) ---------------- */
  const getParentOptions = () => menus.filter(m => !m.parentId); // top-level only

  /* ---------------- create / update / delete ---------------- */
  const createMenu = async (payload) => {
    const res = await fetch(config.Api + "Menu/createMenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  const updateMenu = async (payload) => {
    const res = await fetch(config.Api + "Menu/updateMenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  const deleteMenu = async (_id) => {
    const res = await fetch(config.Api + "Menu/deleteMenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    return await res.json();
  };

  /* ---------------- form helpers ---------------- */
  const openAdd = () => {
    dispatch({ type: "reset" });
    setIsEdit(false);
    setDialogOpen(true);
  };

  const openEdit = (m) => {
    dispatch({ type: "set", payload: {
      _id: m._id,
      label: m.label || "",
      id: m.id || "",
      path: m.path || "",
      icon: m.icon || "",
      parentId: m.parentId?._id || m.parentId || "",
      parentLabel: m.parentLabel || "",
      order: m.order || 0,
      isActive: !!m.isActive
    }});
    setIsEdit(true);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // simple validation
    if (!state.label || !state.id || !state.path) {
      return toast({ title: "Validation", description: "label, id & path are required", variant: "destructive" });
    }
    setLoading(true);
    try {
      const payload = {
        ...state,
        order: parseInt(state.order || 0, 10),
        parentId: state.parentId || null
      };
      if (isEdit) {
        await updateMenu(payload);
        toast({ title: "Updated", description: "Menu updated", variant: "success" });
      } else {
        const createPayload = { ...payload };
        delete createPayload._id;
        await createMenu(createPayload);
        toast({ title: "Created", description: "Menu created", variant: "success" });
      }
      setDialogOpen(false);
      fetchMenus();
      dispatch({ type: "reset" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (m) => {
    setToDelete(m);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setLoading(true);
    try {
      await deleteMenu(toDelete._id);
      toast({ title: "Deleted", description: `${toDelete.label} deleted`, variant: "success" });
      setConfirmOpen(false);
      setToDelete(null);
      fetchMenus();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- JSX render ---------------- */
  return (
    <div className="space-y-6 p-4 min-h-screen bg-slate-950 text-slate-100">
      <div className="flex md:flex-row flex-col items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Registry</h1>
        <div className=" flex  flex-row  items-start mt-5 gap-3">
          <Button onClick={() => fetchMenus()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          {
            Permissions.isAdd && 
             <Button onClick={openAdd} className="flex items-center ">
            <Plus className="w-4 h-4" /> Add Menu
          </Button>
          }
        
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input value={searchTerm} onChange={(e) => handleSearch(e.target.value)} placeholder="Search menus by label, id or path..." className="pl-10" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div>
        {loading && filtered.length === 0 ? (
          <div className="py-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No menus found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m, idx) => (
              <motion.div key={m._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="border border-slate-800 rounded-lg p-4 bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-800`}>
                    <MenuIcon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white truncate">{m.label}</div>
                    <div className="text-xs text-slate-400 font-mono truncate">{m.id}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Path</span>
                    <span className="font-medium text-white truncate max-w-[130px]">{m.path}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Parent</span>
                    <span className="font-medium text-white truncate max-w-[130px]">{m.parentLabel || "Top Level"}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Order</span>
                    <span className="font-medium text-white">{m.order ?? 0}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {
                    Permissions.isEdit && 
                  <Button variant="outline" className="flex-1" onClick={() => openEdit(m)}><Edit className="w-4 h-4 mr-2" />Edit</Button>

                  }

                  {
                    Permissions.isDelete && 
                  <Button variant="destructive" className="flex-1" onClick={() => confirmDelete(m)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>

                  }
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={isEdit ? "Edit Menu" : "Add Menu"} onClose={() => setDialogOpen(false)} className="max-w-lg">
          <div className="space-y-4">
            <div>
              <Label>Label *</Label>
              <Input value={state.label} onChange={(e) => dispatch({ type: "text", name: "label", value: e.target.value })} />
            </div>

            <div>
              <Label>Menu ID *</Label>
              <Input value={state.id} onChange={(e) => dispatch({ type: "text", name: "id", value: e.target.value })} placeholder="e.g., dashboard.main" />
            </div>

            <div>
              <Label>Path *</Label>
              <Input value={state.path} onChange={(e) => dispatch({ type: "text", name: "path", value: e.target.value })} placeholder="e.g., /dashboard" />
            </div>

            <div>
              <Label>Icon</Label>
              <Input value={state.icon} onChange={(e) => dispatch({ type: "text", name: "icon", value: e.target.value })} placeholder="Optional icon name" />
            </div>

            <div>
              <Label>Parent Menu</Label>
              <select value={state.parentId || ""} onChange={(e) => {
                const val = e.target.value;
                const parent = menus.find(x => x._id === val);
                dispatch({ type: "text", name: "parentId", value: val });
                dispatch({ type: "text", name: "parentLabel", value: parent?.label || "" });
              }} className="w-full h-10 rounded-md bg-slate-900 border px-3 text-white">
                <option value="">None (Top Level)</option>
                {getParentOptions().map(p => (
                  <option key={p._id} value={p._id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Order</Label>
              <Input type="number" value={state.order} onChange={(e) => dispatch({ type: "text", name: "order", value: e.target.value })} />
            </div>

            <div className="flex items-center gap-3">
              <input id="isActive" type="checkbox" checked={!!state.isActive} onChange={(e) => dispatch({ type: "text", name: "isActive", value: e.target.checked })} />
              <label htmlFor="isActive" className="text-sm text-slate-300">Active</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => { setDialogOpen(false); dispatch({ type: "reset" }); }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? "Update" : "Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <motion.div className="relative z-50 w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Delete Menu</h3>
            <p className="text-sm text-slate-400 mt-1">Are you sure you want to delete <span className="font-semibold">{toDelete?.label}</span> ? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}</Button>
          </div>
        </motion.div>
      </Dialog>
    </div>
  );
}

/* ---------------- export wrapper with ToastProvider ---------------- */
export default function MenuRegistryPage() {
  return (
    <ToastProvider>
      <MenuRegistryInner />
    </ToastProvider>
  );
}
