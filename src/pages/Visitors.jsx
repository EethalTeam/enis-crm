import React, { useState, useReducer, useCallback, useEffect ,createContext,useContext} from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Upload,
  Trash2,
  Edit,
  RefreshCw,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  X,
  Clock,
  LandPlot,
  Eye,
  Loader2,
} from "lucide-react";

// UI Components (Matching Leads Design)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

// Logic & Utils
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { config } from "@/components/CustomComponents/config";
import Reducer from "@/components/Reducer/commonReducer.js";
import { useAuth } from "@/contexts/AuthContext";

// --- REUSABLE DIALOG COMPONENTS (Matches Leads Design) ---
const Dialog = ({ open, onOpenChange, children }) => (
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
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b border-slate-800 ${className}`}
  >
    {children}
  </div>
);

const DialogTitle = ({ className, children }) => (
  <h2
    className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}
  >
    {children}
  </h2>
);

const DialogFooter = ({ className, children }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-slate-800 bg-slate-950 ${className}`}
  >
    {children}
  </div>
);


// --- TOAST SYSTEM ---
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

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Position changed: top-4, centered horizontally with left-1/2 and -translate-x-1/2 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none px-8">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              // Animation changed: Slides down from top (y) instead of in from right (x)
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
                onClick={() => dismiss(t.id)}
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
export const useToast = () => useContext(ToastContext);

// --- VISITOR DIALOG FORM ---
const VisitorDialog = ({ open, onOpenChange, onSuccess, initialData }) => {
  const { user } = useAuth();
  const { toast } = useToast(); 
 
  const decode = (value) => {
    if (!value) return "";
    try {
      return atob(value);
    } catch (err) {
      return "";
    }
  };
  const role = decode(localStorage.getItem("role"));

  // Initial State matches your reducer structure
  const initialState = {
    _id: "",
    visitorCode: "",
    siteId: "",
    sitename: "",
    visitorName: "",
    visitorEmail: "",
    visitorMobile: "",
    visitorWhatsApp: "",
    visitorPhone: "",
    visitorAddress: "",
    isActive: "",
    feedback: "",
    description: "",
    employeeId: "",
    employeeName: "",
    visitorVariantId: "",
    visitorVariantName: "",
    cityId: "",
    CityName: "",
    StateID: "",
    StateName: "",
    unitId: "",
    UnitName: "",
    plotId: [],
    plotNumber: "",
    statusId: "",
    statusName: "",
    // Follow Up Specifics
    followUpId: "",
    followUpDate: "",
    followedUpById:
      role === "AGENT" ? decode(localStorage.getItem("EmployeeId")) : "",
    followedUpByName:
      role === "AGENT" ? decode(localStorage.getItem("EmployeeName")) : "",
    followUpStatus: "Visit Pending",
    followUpDescription: "",
    notes: "",
    remarks: "",
  };

  const [state, dispatch] = useReducer(Reducer, initialState);
  console.log(state, "state");
  const [activeTab, setActiveTab] = useState("contact");
  const [loading, setLoading] = useState(false);

  // Lists
  const [siteList, setSiteList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [plotList, setPlotList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [variantList, setVariantList] = useState([]);
  // Existing Data (History)
  const [plotDetails, setPlotDetails] = useState([]);
  const [followUpDetails, setFollowUpDetails] = useState([]);

  const isEdit = !!initialData;
  const [Status] = useState([
    { StatusIDPK: 1, StatusName: "Visit Pending" },
    { StatusIDPK: 2, StatusName: "Visit Completed" },
  ]);

  // --- Data Fetching Helpers ---
  const fetchAPI = async (endpoint, body = {}) => {
    try {
      const res = await fetch(config.Api + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Initialization
  useEffect(() => {
    if (open) {
      // 1. Fetch Dropdowns
      fetchAPI("Site/getAllSites").then((res) => setSiteList(res?.data || []));
      fetchAPI("State/getAllStates").then((res) => setStateList(res || []));
      fetchAPI("Visitor/getAllEmployees").then((res) =>
        setEmployeeList(res?.data || [])
      );
      fetchAPI("Visitor/getAllStatus", { unitId: state.unitId }).then((res) =>
        setStatusList(res?.data || [])
      );
      fetchAPI("VisitorVerient/getAllVisitorVariant").then((res) => {
        console.log("VARIANT API ", res);
        setVariantList(res || []);
      });
      // 2. Populate Data if Edit
      if (initialData) {
        populateData(initialData);
      } else {
        // Reset Logic handled by reducer initial state, just clear logic if needed
        dispatch({ type: "reset", payload: initialState });
        setPlotDetails([]);
        setFollowUpDetails([]);
      }
    }
  }, [open, initialData]);

  // Dependent Fetching
  useEffect(() => {
    if (state.siteId) {
      fetchAPI("Unit/getAllUnits", { siteId: state.siteId }).then((res) =>
        setUnitList(res || [])
      );
    } else {
      setUnitList([]);
    }
  }, [state.siteId]);

  useEffect(() => {
    if (state.unitId) {
      fetchAPI("Visitor/getAllPlots/", {
        siteId: state.siteId,
        unitId: state.unitId,
      }).then((res) => setPlotList(res?.data || []));
    } else {
      setPlotList([]);
    }
  }, [state.unitId, state.siteId]);

  const getCityList = (stateId) => {
    if (!stateId) return;
    fetchAPI("City/getAllCitys", { StateID: stateId }).then((res) =>
      setCityList(res || [])
    );
  };

  // Populate Helper
  const populateData = (data) => {
    dispatch({ type: "text", name: "_id", value: data._id || "" });
    dispatch({
      type: "text",
      name: "visitorCode",
      value: data.visitorCode || "",
    });
    dispatch({
      type: "text",
      name: "visitorName",
      value: data.visitorName || "",
    });
    dispatch({
      type: "text",
      name: "visitorEmail",
      value: data.visitorEmail || "",
    });
    dispatch({
      type: "text",
      name: "visitorMobile",
      value: data.visitorMobile || "",
    });
    dispatch({
      type: "text",
      name: "visitorWhatsApp",
      value: data.visitorWhatsApp || "",
    });
    dispatch({
      type: "text",
      name: "visitorPhone",
      value: data.visitorPhone || "",
    });
    dispatch({
      type: "text",
      name: "visitorAddress",
      value: data.visitorAddress || "",
    });
    dispatch({ type: "text", name: "feedback", value: data.feedback || "" });
    dispatch({
      type: "text",
      name: "description",
      value: data.description || "",
    });

    // Location
    if (data.cityId) {
      dispatch({ type: "text", name: "cityId", value: data.cityId._id });
      dispatch({ type: "text", name: "CityName", value: data.cityId.CityName });

      const stateData = data.cityId.StateID;
      if (stateData) {
        const sId = stateData._id || stateData.StateIDPK || stateData;
        dispatch({ type: "text", name: "StateID", value: sId });
        getCityList(sId);
        if (typeof stateData === "object")
          dispatch({
            type: "text",
            name: "StateName",
            value: stateData.StateName,
          });
      }
    }

    // Employee
    if (data.employeeId) {
      dispatch({
        type: "text",
        name: "employeeId",
        value: data.employeeId._id,
      });
      dispatch({
        type: "text",
        name: "employeeName",
        value: data.employeeId.EmployeeName,
      });
    }

    setPlotDetails(data.plots || []);
    setFollowUpDetails(data.followUps || []);
  };

  const storeDispatch = (e, name, fieldType) => {
    if (fieldType === "text")
      dispatch({ type: fieldType, name: name, value: e });
    else if (fieldType === "select") {
      // Mapping logic from your original code
      if (name === "FollowedUpStatus")
        dispatch({ type: "text", name: "followUpStatus", value: e.StatusName });
      if (name === "statusId") {
        dispatch({ type: "text", name: "statusId", value: e._id });
        dispatch({ type: "text", name: "statusName", value: e.statusName });
      }
      if (name === "followedUpById") {
        dispatch({ type: "text", name: "followedUpById", value: e._id });
        dispatch({
          type: "text",
          name: "followedUpByName",
          value: e.EmployeeName,
        });
      }
      if (name === "visitorVariantId") {
        dispatch({ type: "text", name: "visitorVariantId", value: e._id });
        dispatch({
          type: "text",
          name: "visitorVariantName",
          value: e.visitorVerientName,
        });
      }

      if (name === "CityID") {
        dispatch({ type: "text", name: "cityId", value: e.CityIDPK });
        dispatch({ type: "text", name: "CityName", value: e.CityName });
      }
      if (name === "StateID") {
        dispatch({ type: "text", name: "StateID", value: e._id });
        dispatch({ type: "text", name: "StateName", value: e.StateName });
        getCityList(e._id);
      }
      if (name === "siteId") {
        dispatch({ type: "text", name: "siteId", value: e._id });
        dispatch({ type: "text", name: "sitename", value: e.sitename });
        dispatch({ type: "text", name: "unitId", value: "" });
      }
      if (name === "unitId") {
        dispatch({ type: "text", name: "unitId", value: e._id });
        dispatch({ type: "text", name: "UnitName", value: e.UnitName });
      }
      if (name === "plotId") {
        dispatch({ type: "text", name: "plotId", value: e._id });
        dispatch({ type: "text", name: "plotNumber", value: e.plotNumber });
      }
      if (name === "employeeId") {
        dispatch({ type: "text", name: "employeeId", value: e._id });
        dispatch({ type: "text", name: "employeeName", value: e.EmployeeName });
      }
    }
  };

  // --- Submissions ---
  const handleMainSubmit = async () => {
    if (!state.visitorName || !state.visitorMobile || !state.visitorAddress) {
      toast({
        title: "Alert",
        description: "Name, Mobile and Address are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const payload = {
      _id: state._id,
      visitorName: state.visitorName,
      visitorEmail: state.visitorEmail,
      visitorMobile: state.visitorMobile,
      visitorWhatsApp: state.visitorWhatsApp,
      visitorPhone: state.visitorPhone,
      cityId: state.cityId,
      visitorAddress: state.visitorAddress,
      feedback: state.feedback,
      description: state.description,
      employeeId: state.employeeId,
      // For Create Only
      followUpDate: state.followUpDate,
      followedUpById: state.followedUpById,
      followUpStatus: state.followUpStatus,
      followUpDescription: state.followUpDescription,
      notes: state.notes,
      remarks: state.remarks,
    };

    try {
      const url = isEdit ? "Visitor/updateVisitor" : "Visitor/createVisitor";
      const res = await fetch(config.Api + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast({
          title: "Success",
          description: "Visitor saved successfully",
          variant: "success",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save visitor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubItemSubmit = async (type) => {
    setLoading(true);
    try {
      let url = "",
        payload = {};
      if (type === "followup") {
        // Validation
        if (!state.followUpDate || !state.followUpStatus)
          throw new Error("Date and Status required");

        payload = {
          visitorId: state._id,
          followUpId: state.followUpId,
          followUpDate: state.followUpDate,
          followedUpById: state.followedUpById,
          followUpStatus: state.followUpStatus,
          followUpDescription: state.followUpDescription,
          notes: state.notes,
          remarks: state.remarks,
        };
        url = state.followUpId
          ? "Visitor/updateFollowUp"
          : "Visitor/addFollowUp";
      } else {
        // Plot Validation
        if (!state.siteId || !state.unitId || !state.statusId)
          throw new Error("Site, Unit, and Status required");

        payload = {
          visitorId: state._id,
          siteId: state.siteId,
          unitId: state.unitId,
          statusId: state.statusId,
          plotIds: [state.plotId],
          plotId: [state.plotId], // Handling both API naming conventions from your code
        };
        url =
          state.plotId && plotDetails.find((p) => p.plotId._id === state.plotId)
            ? "Visitor/updateVisitorPlot"
            : "Visitor/addPlotToVisitor";
      }

      const res = await fetch(config.Api + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `${type === "followup" ? "Follow Up" : "Plot"} Saved`,
          variant: "success",
        });
        // Refresh sub-lists
        const updated = await res.json();
        if (type === "followup") {
          const refresh = await fetchAPI("Visitor/getVisitorFollowUps", {
            visitorId: state._id,
          });
          setFollowUpDetails(refresh?.followUps || []);
          // Clear form
          dispatch({ type: "text", name: "followUpId", value: "" });
          dispatch({ type: "text", name: "notes", value: "" });
          dispatch({ type: "text", name: "remarks", value: "" });
        } else {
          const refresh = await fetchAPI("Visitor/getVisitorPlots", {
            visitorId: state._id,
          });
          setPlotDetails(refresh?.plots || []);
        }
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      toast({
        title: "Alert",
        description: e.message || "Failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to load a sub-item into form for editing
  const editSubItem = (item, type) => {
    if (type === "followup") {
      dispatch({ type: "text", name: "followUpId", value: item._id });
      dispatch({
        type: "text",
        name: "followUpDate",
        value: item.followUpDate?.split("T")[0],
      });
      dispatch({
        type: "text",
        name: "followUpStatus",
        value: item.followUpStatus,
      });
      dispatch({ type: "text", name: "notes", value: item.notes });
      dispatch({ type: "text", name: "remarks", value: item.remarks });
      if (item.followedUpById) {
        dispatch({
          type: "text",
          name: "followedUpById",
          value: item.followedUpById._id,
        });
        dispatch({
          type: "text",
          name: "followedUpByName",
          value: item.followedUpById.EmployeeName,
        });
      }
    }
    // Add Plot edit logic here if needed (similar pattern)
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
        activeTab === id
          ? "bg-fuchsia-600 text-white shadow-md"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="hidden md:inline">{label}</span>
      {activeTab === id && (
        <motion.div
          layoutId="activeVisitorTab"
          className="absolute inset-0 rounded-md bg-fuchsia-600 -z-10"
        />
      )}
    </button>
  );

   const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const min = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader>
          <div className="flex justify-between items-center w-full">
            <DialogTitle>
              {isEdit ? "Edit Visitor" : "Add New Visitor"}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-slate-900/50 rounded-lg w-fit border border-slate-800 mb-6">
            <TabButton id="contact" label="Contact Details" icon={User} />
            <TabButton id="followup" label="Follow Up Details" icon={Clock} />
            <TabButton id="plots" label="Plot Details" icon={LandPlot} />
          </div>

          {/* --- TAB 1: CONTACT --- */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Visitor Name *</Label>
                <Input
                  value={state.visitorName}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "visitorName", "text")
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile *</Label>
                <Input
                  value={state.visitorMobile}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "visitorMobile", "text")
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={state.visitorEmail}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "visitorEmail", "text")
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={state.visitorWhatsApp}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "visitorWhatsApp", "text")
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <select
                  value={state.StateID}
                  onChange={(e) => {
                    const selected = stateList.find(
                      (s) => String(s._id) === e.target.value
                    );
                    storeDispatch(selected, "StateID", "select");
                  }}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                >
                  <option value="">Select State</option>
                  {stateList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.StateName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <select
                  value={state.cityId}
                  onChange={(e) => {
                    const selected = cityList.find(
                      (c) => String(c._id) === e.target.value
                    );
                    storeDispatch(selected, "CityID", "select");
                  }}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                >
                  <option value="">Select City</option>
                  {cityList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.CityName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Referred By</Label>
                <select
                  value={state.employeeId}
                  onChange={(e) => {
                    const selected = employeeList.find(
                      (emp) => String(emp._id) === e.target.value
                    );
                    storeDispatch(selected, "employeeId", "select");
                  }}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                >
                  <option value="">Select Employee</option>
                  {employeeList.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.EmployeeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Visitor Variant</Label>
                <select
                  value={state.visitorVariantId || ""}
                  onChange={(e) => {
                    const selected = variantList.find(
                      (v) => String(v._id) === e.target.value
                    );
                    storeDispatch(selected, "visitorVariantId", "select");
                  }}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                >
                  <option value="">Select Variant</option>
                  {variantList.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.visitorVerientName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label>Address *</Label>
                <Textarea
                  value={state.visitorAddress}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "visitorAddress", "text")
                  }
                  className="bg-slate-900 border-slate-700 text-white h-20"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={state.description}
                  onChange={(e) =>
                    storeDispatch(e.target.value, "description", "text")
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>
          )}

          {/* --- TAB 2: FOLLOW UPS --- */}
          {activeTab === "followup" && (
            <div className="space-y-6">
              {/* Add/Edit Form */}
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider">
                  {state.followUpId ? "Edit" : "Add"} Follow Up
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      className="text-white bg-slate-900 border-slate-700"
                       style={{ colorScheme: "dark" }}
                      value={state.followUpDate}
                      onChange={(e) =>
                        storeDispatch(e.target.value, "followUpDate", "text")
                      }
                       min={min}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={state.followUpStatus}
                      onChange={(e) => {
                        const selected = Status.find(
                          (s) => s.StatusName === e.target.value
                        );
                        storeDispatch(selected, "FollowedUpStatus", "select");
                      }}
                      className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                    >
                      <option value="">Select</option>
                      {Status.map((s) => (
                        <option key={s.StatusIDPK} value={s.StatusName}>
                          {s.StatusName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Staff</Label>
                    <select
                      value={state.followedUpById}
                      onChange={(e) => {
                        const selected = employeeList.find(
                          (emp) => String(emp._id) === e.target.value
                        );
                        storeDispatch(selected, "followedUpById", "select");
                      }}
                      className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                    >
                      <option value="">Select Staff</option>
                      {employeeList.map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.EmployeeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={state.notes}
                      onChange={(e) =>
                        storeDispatch(e.target.value, "notes", "text")
                      }
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
                {isEdit && (
                  <Button
                    size="sm"
                    onClick={() => handleSubItemSubmit("followup")}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    )}{" "}
                    Save Follow Up
                  </Button>
                )}
              </div>

              {/* History List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  Follow Up History
                </h3>
                {followUpDetails.length === 0 ? (
                  <p className="text-sm text-slate-500">No history found.</p>
                ) : (
                  <div className="space-y-3">
                    {followUpDetails.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-start bg-slate-900/40 p-3 rounded-md border border-slate-800"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                item.followUpStatus === "Visit Pending"
                                  ? "destructive"
                                  : "default"
                              }
                              className={
                                item.followUpStatus === "Visit Completed"
                                  ? "bg-green-600"
                                  : ""
                              }
                            >
                              {item.followUpStatus}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {item.followUpDate?.split("T")[0]}
                            </span>
                          </div>
                          <p className="text-sm text-slate-200">{item.notes}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            By: {item.followedUpById?.EmployeeName || "Unknown"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editSubItem(item, "followup")}
                          className="text-yellow-500 hover:text-yellow-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 3: PLOT DETAILS --- */}
          {activeTab === "plots" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider">
                  Add Plot Interest
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site</Label>
                    <select
                      value={state.siteId}
                      onChange={(e) => {
                        const selected = siteList.find(
                          (s) => s._id === e.target.value
                        );
                        storeDispatch(selected, "siteId", "select");
                      }}
                      className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                    >
                      <option value="">Select Site</option>
                      {siteList.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.sitename}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <select
                      value={state.unitId}
                      onChange={(e) => {
                        const selected = unitList.find(
                          (u) => u._id === e.target.value
                        );
                        storeDispatch(selected, "unitId", "select");
                      }}
                      className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                    >
                      <option value="">Select Unit</option>
                      {unitList.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.UnitName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plot No</Label>
                    <select
                      value={state.plotId}
                      onChange={(e) => {
                        const selected = plotList.find(
                          (p) => p._id === e.target.value
                        );
                        storeDispatch(selected, "plotId", "select");
                      }}
                      className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                    >
                      <option value="">Select Plot</option>
                      {plotList.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.plotNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={state.statusId}
                      onChange={(e) => {
                        const selected = statusList.find(
                          (s) => s._id === e.target.value
                        );
                        storeDispatch(selected, "statusId", "select");
                      }}
                      className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-white"
                    >
                      <option value="">Select Status</option>
                      {statusList.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.statusName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {isEdit && (
                  <Button
                    size="sm"
                    onClick={() => handleSubItemSubmit("plot")}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    )}{" "}
                    Save Plot Info
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  Plot History
                </h3>
                {plotDetails.length === 0 ? (
                  <p className="text-sm text-slate-500">No plots assigned.</p>
                ) : (
                  <table className="w-full text-left bg-slate-900/40 rounded-md overflow-hidden text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        {role !== "AGENT" && <th className="p-3">Site</th>}
                        <th className="p-3">Unit</th>
                        <th className="p-3">Plot No</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-200">
                      {plotDetails.map((item, i) => (
                        <tr key={i} className="border-t border-slate-800">
                          {role !== "AGENT" && (
                            <td className="p-3">
                              {item.plotId.siteId?.sitename}
                            </td>
                          )}
                          <td className="p-3">
                            {item.plotId?.unitId.UnitName}
                          </td>
                          <td className="p-3">{item.plotId?.plotNumber}</td>
                          <td className="p-3">
                            <Badge
                              style={{
                                backgroundColor:
                                  item.statusId?.colorCode || "gray",
                              }}
                            >
                              {item.statusId?.statusName}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {/* Only show main save on Contact Tab or New Entry */}
          {(!isEdit || activeTab === "contact") && (
            <Button
              onClick={handleMainSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{" "}
              Save Visitor
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- MAIN DASHBOARD CONTENT ---
function VisitorContent() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const { toast } = useToast();

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    const employeeId = localStorage.getItem("EmployeeID");
    try {
      const res = await fetch(config.Api + "Visitor/getAllVisitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      const data = await res.json();
      setVisitors(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleDelete = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#1e293b",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(config.Api + "Employee/deleteEmployee", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
          });
          if (res.ok) {
            toast({
              title: "Deleted",
              description: "Data deleted successfully.",
            });
            fetchVisitors();
          }
        } catch (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    });
  };

  const filteredVisitors = visitors.filter(
    (v) =>
      (v.visitorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.visitorMobile || "").includes(searchTerm)
  );

  return (
    <div className="space-y-6 bg-slate-950 min-h-screen p-4 mt-3 text-slate-100">
      <Helmet>
        <title>Visitors - CRM</title>
      </Helmet>

      {/* HEADER */}
      <div className="flex md:flex-row flex-col items-start md:justify-between gap-3">
        <h1 className="md:text-3xl text-xl font-bold text-white">Visitors</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20"
          >
            <Upload className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            onClick={() => {
              setSelectedVisitor(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold border-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Visitor
          </Button>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
              <Input
                placeholder="Search by name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white"
              />
            </div>
            <Button
              variant="ghost"
              onClick={fetchVisitors}
              className="text-fuchsia-300"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>

          {/* DESKTOP TABLE */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-white">
                  {/* <th className="py-3 px-4">Code</th> */}
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* <td className="py-3 px-4 text-slate-300 text-sm">
                      {row.visitorCode || "N/A"}
                    </td> */}
                    <td className="py-3 px-4 font-medium text-white">
                      <span
                        onClick={() => {
                          setSelectedVisitor(row);
                          setDialogOpen(true);
                        }}
                        className="cursor-pointer underline-offset-4 group-hover:underline text-fuchsia-400"
                      >
                        {row.visitorName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {row.visitorMobile}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {row.visitorEmail}
                    </td>
                    <td className="py-3 px-4 flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedVisitor(row);
                          setDialogOpen(true);
                        }}
                        className="text-yellow-400 hover:bg-yellow-400/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(row)}
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="space-y-4 md:hidden">
            {filteredVisitors.map((row) => (
              <div
                key={row._id}
                className="rounded-xl border border-slate-700 bg-slate-900 shadow-md p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400">
                      Code: {row.visitorCode}
                    </p>
                    <h3
                      className="text-lg font-bold text-fuchsia-400"
                      onClick={() => {
                        setSelectedVisitor(row);
                        setDialogOpen(true);
                      }}
                    >
                      {row.visitorName}
                    </h3>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4" /> {row.visitorMobile}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4" /> {row.visitorEmail}
                  </div>
                </div>
                <div className="flex justify-start gap-3 pt-3 border-t border-slate-800">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedVisitor(row);
                      setDialogOpen(true);
                    }}
                    className="text-yellow-400"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(row)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <VisitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchVisitors}
        initialData={selectedVisitor}
      />
    </div>
  );
}

export default function VisitorMain() {
  return(
 <ToastProvider>
     <VisitorContent />
   </ToastProvider>
  )
  
  
}
