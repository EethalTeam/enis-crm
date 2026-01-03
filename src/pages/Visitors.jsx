import React, { useState, useReducer, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Upload, Trash2, Edit, ArrowLeft, RefreshCw,
  User, Phone, Mail, MessageCircle
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Logic & Utils
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { config } from '@/components/CustomComponents/config'; 
import Reducer from '@/components/Reducer/commonReducer.js'; 
import Loading from '@/components/CustomComponents/Loading';
import { useAuth } from '@/contexts/AuthContext';



export default function VisitorMain() {
  // --- Initial State ---
  const { user } = useAuth();
  const decode = (value) => {
    if (!value) return "";
    try {
        return atob(value);
    } catch (err) {
        console.error("Decode failed:", err);
        return "";
    }
};
const initialState = {
  _id: '',
  visitorCode:'',
  siteId: '', 
  sitename: '', 
  visitorName:'',
  visitorEmail:'',
  visitorMobile:'',
  visitorWhatsApp:'',
  visitorPhone:'',
  visitorAddress:'',
  isActive:'',
  feedback:'',
  description:'',
  employeeId:'',
  employeeName:'',
  cityId:'',
  CityName:'',
  StateID:'',
  StateName:'',
  unitId:'',
  UnitName:'',
  plotId:[],
  plotNumber:'',
  statusId:'',
  statusName:'',
  followUpId:'',
  followUpDate:'',
  followedUpById:user.role === 'AGENT' ? decode(localStorage.getItem("EmployeeId")) : '',
  followedUpByName:user.role === 'AGENT' ? decode(localStorage.getItem("EmployeeName")) : '',
  followUpStatus:'',
  followUpDescription:'',
  notes:'',
  remarks:''
};
  const { toast } = useToast();
  
  // --- State Declarations ---
  const [showentry, setShowEntry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useReducer(Reducer, initialState);

  
  const [Visitor, setVisitor] = useState([]);
  const [PlotDetails, setPlotDetails] = useState([]);
  const [FollowUpDetails, setFollowUpDetails] = useState([]);
  
  const [isEdit, setIsEdit] = useState(false);
  const [followUpEdit, setfollowUpEdit] = useState(false);
  const [PlotEdit, setPlotEdit] = useState(false);
  const [AddFollow, setAddFollow] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  
  const [OrderTab, setOrderTab] = useState('Follow Up');
  
  // --- SEPARATED LISTS TO PREVENT CONFLICT ---
  const [siteList, setSiteList] = useState([]); 
  const [unitList, setUnitList] = useState([]); 
  const [plotList, setPlotList] = useState([]); 
  const [statusList, setStatusList] = useState([]); 
  const [employeeList, setEmployeeList] = useState([]); 
  const [stateList, setStateList] = useState([]); // Separate State List
  const [cityList, setCityList] = useState([]);   // Separate City List

  const [Status] = useState([
    { StatusIDPK: 1, StatusName: "Visit Pending" },
    { StatusIDPK: 2, StatusName: "Visit Completed" }
  ]);
  
  // --- Effects ---
  useEffect(() => {
    getVisitor();
    getSites();
    getStatusList();
    getStateList(); // Fetch states on mount
    getEmployeeList(); // Fetch employees on mount
  }, []);

  // Fetch Units when Site Changes
  useEffect(() => {
    const getUnits = async () => {
      if (!state.siteId) {
          setUnitList([]); 
          return; 
      }
      try {
        const response = await fetch(config.Api + "Unit/getAllUnits", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId: state.siteId }), 
        });
        const result = await response.json();
        if (Array.isArray(result)) setUnitList(result);
      } catch (err) { console.error(err); }
    };
    getUnits();
  }, [state.siteId]);

  // Fetch Plots when Unit Changes
  useEffect(()=>{
    const getPlotList = async () => {
      try {
        let url = config.Api + "Visitor/getAllPlots/";
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({siteId:state.siteId, unitId: state.unitId}),
        });
        const result = await response.json();
        setPlotList(result.data);
      } catch (error) { console.error(error); }
    };
    if(state.unitId) getPlotList();
  },[state.siteId, state.unitId]);

  // --- Search Logic ---
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const handleSearchChange = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      if (Visitor.length > 0) {
        applySearchFilter(value);
      }
    }, 300),
    [Visitor]
  );

  const applySearchFilter = (search) => {
    if (Visitor.length === 0) return;
    let data = [...Visitor];
    const filtered = data.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  // --- Clear Functions ---
  const clear = () => {
    setIsEdit(false);
    setAddFollow(false); 
    dispatch({ type: 'text', name: '_id', value: "" });
    dispatch({ type: 'text', name: "visitorCode", value:'' });
    dispatch({ type: 'text', name: "visitorName", value:'' });
    dispatch({ type: 'text', name: "visitorEmail", value:'' });
    dispatch({ type: 'text', name: "visitorMobile", value:'' });
    dispatch({ type: 'text', name: "visitorWhatsApp", value:'' });
    dispatch({ type: 'text', name: "visitorPhone", value:'' });
    dispatch({ type: 'text', name: "visitorAddress", value:'' });
    dispatch({ type: 'text', name: "feedback", value:'' });
    dispatch({ type: 'text', name: "description", value:'' });
    dispatch({ type: 'text', name: "cityId", value:'' });
    dispatch({ type: 'text', name: "CityName", value: '' });
    dispatch({ type: 'text', name: "StateID", value:'' });
    dispatch({ type: 'text', name: "StateName", value: '' });
    dispatch({ type: 'text', name: "employeeId", value:'' });
    dispatch({ type: 'text', name: "employeeName", value: '' });
    
    // Sub forms
    cleaerFollowUp();
    setPlotDetails([]);
    setFollowUpDetails([]);
    setCityList([]); // Clear cities when clearing form
  };

  const cleaerFollowUp = () => {
    dispatch({ type: 'text', name: "followUpId", value:'' });
    dispatch({ type: 'text', name: "followUpDate", value:'' });
    dispatch({ type: 'text', name: "followedUpById", value:'' });
    dispatch({ type: 'text', name: "followedUpByName", value:'' });
    dispatch({ type: 'text', name: "followUpStatus", value: "Pending" });
    dispatch({ type: 'text', name: "followUpDescription", value:'' });
    dispatch({ type: 'text', name: "notes", value:'' });
    dispatch({ type: 'text', name: "remarks", value:'' });
  };

  const clearPlot = () => {
    dispatch({ type: 'text', name: "plotId", value:'' });
    dispatch({ type: 'text', name: "plotNumber", value:''});
    dispatch({ type: 'text', name: "unitId", value:'' });
    dispatch({ type: 'text', name: "UnitName", value:'' });
    dispatch({ type: 'text', name: "statusId", value:'' });
    dispatch({ type: 'text', name: "statusName", value:''});
  };

  // --- API Fetchers ---
  const getVisitor = async () => {
    try {
      setLoading(true);
      const employeeId = localStorage.getItem('EmployeeID');
      let url = config.Api + "Visitor/getAllVisitor";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({employeeId:employeeId}),
      });
      const result = await response.json();
      setVisitor(result.data);
      setFilteredData(result.data);
    } catch (error) { console.error('Error:', error); } 
    finally { setLoading(false); }
  };

  const getSites = async () => {
    try {
      let url = config.Api + "Site/getAllSites"; 
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      setSiteList(result.data);
    } catch (error) { console.error(error); }
  };

  const getStateList = async () => {
    try {
      let url = config.Api + "State/getAllStates";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      setStateList(result); // Using separate state
    } catch (error) { console.error(error); }
  };

  // Updated to accept optional ID for Edit scenario
  const getCityList = async (id) => {
    const targetStateId = id || state.StateID;
    if(!targetStateId) return;

    try {
      let url = config.Api + "City/getAllCitys";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({StateID: targetStateId}),
      });
      const result = await response.json();
      setCityList(result); // Using separate state
    } catch (error) { console.error(error); }
  };

  const getStatusList = async () => {
    try {
      let url = config.Api + "Visitor/getAllStatus/";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({unitId: state.unitId}),
      });
      const result = await response.json();
      setStatusList(result.data);
    } catch (error) { console.error(error); }
  };

  const getEmployeeList = async () => {
    try {
      let url = config.Api + "Visitor/getAllEmployees/";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      setEmployeeList(result.data); // Using separate state
    } catch (error) { console.error(error); }
  };

  const getVisitorFollowUps = async () => {
    try {
      let url = config.Api + "Visitor/getVisitorFollowUps";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({visitorId:state._id}),
      });
      const result = await response.json();
      setFollowUpDetails(result.followUps);
    } catch (error) { console.error('Error:', error); }
  };

  const getVisitorPlots = async () => {
    try {
      let url = config.Api + "Visitor/getVisitorPlots";
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({visitorId:state._id}),
      });
      const result = await response.json();
      setPlotDetails(result.plots);
    } catch (error) { console.error('Error:', error); }
  };

  // --- CRUD Operations ---
  const createVisitor = async (data) => {
    setLoading(true);
    let url = config.Api + "Visitor/createVisitor";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!response.ok) throw new Error('Failed');
    setShowEntry(false);
    return response.json();
  };

  const updateVisitor = async (data) => {
    setLoading(true);
    let url = config.Api + "Visitor/updateVisitor";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  };

  const addFollowUp = async (data) => {
    setLoading(true);
    let url = config.Api + "Visitor/addFollowUp";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!response.ok) throw new Error('Failed');
    setAddFollow(false);
    return response.json();
  };

  const updateFollowUp = async (data) => {
    setLoading(true);
    let url = config.Api + "Visitor/updateFollowUp";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!response.ok) throw new Error('Failed');
    setAddFollow(false);
    return response.json();
  };

  const addPlots = async (data) => {
    setLoading(true);
    let url = config.Api + "Visitor/addPlotToVisitor";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!response.ok) throw new Error('Failed');
    setAddFollow(false);
    return response.json();
  };

  const updatePlots = async (data) => {
    setLoading(true);
    let url = config.Api + "Visitor/updateVisitorPlot";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!response.ok) throw new Error('Failed');
    setAddFollow(false);
    return response.json();
  };

  const deleteRow = async (data) => {
    setLoading(true);
    let url = config.Api + "Employee/deleteEmployee";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed');
    getVisitor();
    setLoading(false);
    return response.json();
  };

  // --- Dispatch Helper ---
  const storeDispatch = useCallback((e, name, fieldType) => {
    if (fieldType === "text") dispatch({ type: fieldType, name: name, value: e });
    else if (fieldType === "number") dispatch({ type: fieldType, name: name, number: Number(e) });
    else if (fieldType === "select") {
        if (name === 'FollowedUpStatus') dispatch({ type: 'text', name: "followUpStatus", value: e.StatusName });
        
        if (name === 'statusId') {
            dispatch({ type: 'text', name: "statusId", value: e._id });
            dispatch({ type: 'text', name: "statusName", value: e.statusName });
        }
        if (name === 'followedUpById') {
            dispatch({ type: 'text', name: "followedUpById", value: e._id });
            dispatch({ type: 'text', name: "followedUpByName", value: e.EmployeeName });
        }
        // Logic for City
        if (name === 'CityID') {
            dispatch({ type: 'text', name: "cityId", value: e.CityIDPK });
            dispatch({ type: 'text', name: "CityName", value: e.CityName });
        }
        // Logic for State (Triggers City Reset)
        if (name === "StateID") {
            dispatch({ type: 'text', name: 'StateID', value: e.StateIDPK });
            dispatch({ type: 'text', name: "StateName", value: e.StateName });
            // Reset City
            dispatch({ type: 'text', name: "cityId", value: '' });
            dispatch({ type: 'text', name: "CityName", value: '' });
            // Fetch Cities
            getCityList(e.StateIDPK);
        }
        if (name === 'siteId') {
          dispatch({ type: 'text', name: "siteId", value: e._id });
          dispatch({ type: 'text', name: "sitename", value: e.sitename });
          dispatch({ type: 'text', name: "unitId", value: '' });
          dispatch({ type: 'text', name: "UnitName", value: '' });
       }
        if (name === 'unitId') {
            dispatch({ type: 'text', name: 'unitId', value: e._id });
            dispatch({ type: 'text', name: "UnitName", value: e.UnitName });
        }
        if (name === 'plotId') {
          dispatch({ type: 'text', name: 'plotId', value: e._id })
          dispatch({ type: 'text', name: 'plotNumber', value: e.plotNumber })
        };
        
        if (name === 'employeeId') {
            dispatch({ type: 'text', name: "employeeId", value: e._id });
            dispatch({ type: 'text', name: "employeeName", value: e.EmployeeName });
        }
    }
  }, []);

  // --- Validation & Submits ---
  const Validate = () => {
    if (!state.visitorName) { toast({ title: "Error", description: "Please enter Visitor Name", variant: "destructive" }); return; }
    if (!state.visitorMobile) { toast({ title: "Error", description: "Please enter Mobile Number", variant: "destructive" }); return; }
    if (!state.visitorAddress) { toast({ title: "Error", description: "Please enter Address", variant: "destructive" }); return; }
    showAlert('Main');
  };

  const ValidateFollowUp = () => {
    if (!state.followUpDate) { toast({ title: "Error", description: "Enter Follow up date", variant: "destructive" }); return; }
    if (!state.followedUpById) { toast({ title: "Error", description: "Assign a staff", variant: "destructive" }); return; }
    if (!state.followUpStatus) { toast({ title: "Error", description: "Select status", variant: "destructive" }); return; }
    showAlert('Follow Up');
  };

  const ValidatePlot = () => {
     if (!state.siteId) { toast({ title: 'Error', description: 'Please select a Site', variant: 'destructive' }); return; }
    if (!state.unitId) { toast({ title: "Error", description: "Select Unit", variant: "destructive" }); return; }
    if (!state.statusName) { toast({ title: "Error", description: "Select Status", variant: "destructive" }); return; }
    showAlert(OrderTab);
  };

  const showAlert = (val) => {
    Swal.fire({
      title: 'Are you sure?',
      text: isEdit ? 'Do you really want to Update this data?' : 'Do you really want to save this data?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d946ef', 
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, confirm!',
      background: '#1e293b', 
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          val === 'Main' ? await handleSubmit() : val === 'Follow Up' ? await FollowUpSubmit() : await PlotSubmit();
        } catch (error) {
           toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      }
    });
  };

  const DeleteAlert = (row) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this data?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#1e293b',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteRow(row);
          toast({ title: "Deleted", description: "Data deleted successfully." });
        } catch (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      }
    });
  };

  const handleSubmit = async () => {
    const updateData = {
       _id: state._id, visitorName:state.visitorName, visitorEmail:state.visitorEmail,
       visitorMobile:state.visitorMobile, visitorWhatsApp:state.visitorWhatsApp,
       visitorPhone:state.visitorPhone, cityId:state.cityId, visitorAddress:state.visitorAddress,
       feedback:state.feedback, description:state.description, employeeId:state.employeeId
    };
 
    const saveData={
        visitorName:state.visitorName, visitorEmail:state.visitorEmail, visitorMobile:state.visitorMobile,
        visitorWhatsApp:state.visitorWhatsApp, visitorPhone:state.visitorPhone, cityId:state.cityId,
        visitorAddress:state.visitorAddress, feedback:state.feedback, description:state.description,
        employeeId:state.employeeId,
        followUpDate:state.followUpDate ? state.followUpDate : '',
        followedUpById:state.followedUpById, followUpStatus:state.followUpStatus,
        followUpDescription:state.followUpDescription, notes:state.notes, remarks:state.remarks
    }

    if (isEdit) {
      await updateVisitor(updateData);
      toast({ title: "Success", description: "Visitor Updated successfully!" });
    } else {
      await createVisitor(saveData);
      toast({ title: "Success", description: "Visitor created successfully!" });
    }
    clear();
    getVisitor();
  };

  const FollowUpSubmit = async () => {
    const saveData = {
        visitorId: state._id, followUpDate:state.followUpDate,
        followedUpById:state.followedUpById, followUpStatus:state.followUpStatus,
        followUpDescription:state.followUpDescription, notes:state.notes, remarks:state.remarks
    };
    const updateData ={
        visitorId: state._id, followUpId:state.followUpId,
        followUpDate:state.followUpDate,
        followedUpById:state.followedUpById, followUpStatus:state.followUpStatus,
        followUpDescription:state.followUpDescription, notes:state.notes, remarks:state.remarks
    }
    if (followUpEdit) {
       await updateFollowUp(updateData);
       toast({ title: "Success", description: "Follow up Updated!" });
    } else {
       await addFollowUp(saveData);
       toast({ title: "Success", description: "Follow up Added!" });
    }
    cleaerFollowUp();
    getVisitorFollowUps();
  };

  const PlotSubmit = async () => {
     const saveData = {siteId: state.siteId, visitorId: state._id, statusId: state.statusId, plotIds:[state.plotId], unitId:state.unitId };
     const updateData ={siteId: state.siteId, visitorId: state._id, statusId: state.statusId, plotId:[state.plotId], unitId:state.unitId };

     if (PlotEdit) {
        await updatePlots(updateData);
        toast({ title: "Success", description: "Plot Details Updated!" });
     } else {
        await addPlots(saveData);
        toast({ title: "Success", description: "Plot Details Added!" });
     }
     clearPlot();
     getVisitorPlots();
  };

  // --- EDIT LOGIC (Fixed) ---
  const editTable = (data) => {
    setShowEntry(true);
    setIsEdit(true);
    dispatch({ type: 'text', name: '_id', value: data._id || '' });
    dispatch({ type: 'text', name: "visitorCode", value: data.visitorCode || '' });
    dispatch({ type: 'text', name: "visitorName", value: data.visitorName || '' });
    dispatch({ type: 'text', name: "visitorEmail", value: data.visitorEmail || '' });
    dispatch({ type: 'text', name: "visitorMobile", value: data.visitorMobile || '' });
    dispatch({ type: 'text', name: "visitorWhatsApp", value: data.visitorWhatsApp || '' });
    dispatch({ type: 'text', name: "visitorPhone", value: data.visitorPhone || '' });
    dispatch({ type: 'text', name: "visitorAddress", value: data.visitorAddress || '' });
    dispatch({ type: 'text', name: "feedback", value: data.feedback || '' });
    dispatch({ type: 'text', name: "description", value: data.description || '' });
    
    // Site & Unit
    if(data.unitId?.siteId) {
        dispatch({ type: 'text', name: "siteId", value: data.unitId.siteId._id || data.unitId.siteId });
        dispatch({ type: 'text', name: "sitename", value: data.unitId.siteId.sitename || '' });
    }
    
    // City & State
    if(data.cityId) {
        // Set City Data
        dispatch({ type: 'text', name: "cityId", value: data.cityId._id });
        dispatch({ type: 'text', name: "CityName", value: data.cityId.CityName });
        
        // Handle State Population
        const stateData = data.cityId.StateID;
        let stateIDToFetch = null;

        if (stateData && typeof stateData === 'object') {
            dispatch({ type: 'text', name: "StateID", value: stateData._id || stateData.StateIDPK });
            dispatch({ type: 'text', name: "StateName", value: stateData.StateName });
            stateIDToFetch = stateData._id || stateData.StateIDPK;
        } else if (stateData) {
            dispatch({ type: 'text', name: "StateID", value: stateData });
            stateIDToFetch = stateData;
        }

        // IMPORTANT: Trigger City List fetch for this State
        if (stateIDToFetch) {
            getCityList(stateIDToFetch);
        }
    }

    if(data.employeeId) {
        dispatch({ type: 'text', name: "employeeId", value: data.employeeId._id });
        dispatch({ type: 'text', name: "employeeName", value: data.employeeId.EmployeeName });
    }
    setPlotDetails(data.plots || []);
    setFollowUpDetails(data.followUps || []);
  };

  const EditFollowup = (data) => {
    dispatch({ type: 'text', name: "followUpId", value: data._id || '' });
    dispatch({ type: 'text', name: "followUpDate", value: data.followUpDate ? data.followUpDate.split('T')[0].split('-').reverse().join('-') : '' });
    if(data.followedUpById){
        dispatch({ type: 'text', name: "followedUpById", value: data.followedUpById._id || '' });
        dispatch({ type: 'text', name: "followedUpByName", value: data.followedUpById.EmployeeName || '' });
    }
    dispatch({ type: 'text', name: "followUpStatus", value: data.followUpStatus || '' });
    dispatch({ type: 'text', name: "followUpDescription", value: data.followUpDescription || '' });
    dispatch({ type: 'text', name: "notes", value: data.notes || '' });
    dispatch({ type: 'text', name: "remarks", value: data.remarks || '' });
    setAddFollow(true);
    setfollowUpEdit(true);
  };

  const EditPlot = (data) => {
     if(data.plotId){
        dispatch({ type: 'text', name: "plotId", value: data.plotId._id || '' });
        dispatch({ type: 'text', name: "plotNumber", value: data.plotId.plotNumber || ''});
        if(data.plotId.unitId){
            dispatch({ type: 'text', name: "unitId", value: data.plotId.unitId._id || '' });
            dispatch({ type: 'text', name: "UnitName", value: data.plotId.unitId.UnitName || '' });
        }
     }
     if(data.statusId){
        dispatch({ type: 'text', name: "statusId", value: data.statusId._id || '' });
        dispatch({ type: 'text', name: "statusName", value: data.statusId.statusName || ''});
     }
     setAddFollow(true);
     setPlotEdit(true);
  };

  // --- Reusable Component ---
  const GlassSelect = ({ 
    label, value, onChange, onFocus, options, placeholder, disabled, displayKey, valueKey 
  }) => (
    <div className="space-y-2">
      <Label className="text-white font-semibold">{label} <span className="text-red-500">*</span></Label>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onFocus={onFocus} 
          onChange={(e) => {
            const selectedObj = options.find(item => String(item[valueKey]) === e.target.value || String(item[displayKey]) === e.target.value);
            onChange(selectedObj); 
          }}
          className="w-full bg-purple-900/50 border border-fuchsia-700 text-white rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 appearance-none"
        >
          <option value="" className="bg-slate-900 text-gray-400">{placeholder || "Select..."}</option>
          {(options||[]).map((item, idx) => (
            <option key={idx} value={item[valueKey] || item[displayKey]} className="bg-slate-900 text-white">
              {item[displayKey]}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fuchsia-300">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <Loading loading={loading}>
      <Helmet>
        <title>Visitors - ENIS CRM</title>
        <meta name="description" content="Manage visitors and leads" />
      </Helmet>

      <div className="space-y-6 p-4 min-h-screen bg-transparent">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">{showentry ? (isEdit ? 'Edit Visitor' : 'New Visitor') : 'Visitors'}</h1>
          <div className="flex gap-3">
            {!showentry && (
                <>
                <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
                    <Upload className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button onClick={() => { setShowEntry(true); clear(); }} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Add Visitor
                </Button>
                </>
            )}
            {showentry && (
                <Button variant="outline" onClick={() => { setShowEntry(false); clear(); }} className="border-fuchsia-700 text-white hover:bg-fuchsia-900/20">
                   <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
            )}
          </div>
        </div>

        {/* LIST TABLE */}
        {!showentry && (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
                <Input
                  placeholder="Search visitors..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
                />
              </div>
              <Button variant="ghost" onClick={() => { if(!searchTerm) getVisitor(); }} className="text-fuchsia-300">
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Visitor Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Mobile</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <motion.tr
                      key={row._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-300">{row.visitorCode || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-white">{row.visitorName}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.visitorEmail}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{row.visitorMobile}</td>
                      <td className="py-3 px-4 flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => editTable(row)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                           <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => DeleteAlert(row)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        )}

        {/* ADD/EDIT FORM */}
        {showentry && (
         <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader><CardTitle className="text-fuchsia-400 flex items-center gap-2"><User className="w-5 h-5"/> Basic Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-white">Visitor Name <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-fuchsia-400" />
                            <Input value={state.visitorName} onChange={(e) => storeDispatch(e.target.value, "visitorName", "text")} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white" placeholder="Name" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-fuchsia-400" />
                            <Input value={state.visitorEmail} onChange={(e) => storeDispatch(e.target.value, "visitorEmail", "text")} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white" placeholder="Email" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Mobile <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-fuchsia-400" />
                            <Input type="number" value={state.visitorMobile} onChange={(e) => storeDispatch(e.target.value, "visitorMobile", "text")} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white" placeholder="Mobile" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">WhatsApp</Label>
                        <div className="relative">
                            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-fuchsia-400" />
                            <Input type="number" value={state.visitorWhatsApp} onChange={(e) => storeDispatch(e.target.value, "visitorWhatsApp", "text")} className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white" placeholder="WhatsApp" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Phone</Label>
                         <Input type="number" value={state.visitorPhone} onChange={(e) => storeDispatch(e.target.value, "visitorPhone", "text")} className="bg-purple-900/50 border-fuchsia-700 text-white" placeholder="Phone" />
                    </div>
                    
                    {/* UPDATED SELECTS WITH SPECIFIC LISTS */}
                    <GlassSelect 
                        label="State" 
                        value={state.StateName} 
                        displayKey="StateName"
                        valueKey="StateIDPK"
                        options={stateList} // USE stateList
                        onChange={(e) => storeDispatch(e, 'StateID', 'select')} 
                        placeholder="Select State"
                    />
                    <GlassSelect 
                        label="City" 
                        value={state.CityName}
                        displayKey="CityName"
                        valueKey="CityIDPK"
                        options={cityList} // USE cityList
                        onChange={(e) => storeDispatch(e, 'CityID', 'select')} 
                        placeholder="Select City"
                        disabled={!state.StateID}
                    />
                    <GlassSelect 
                         label="Referred By" 
                         value={state.employeeName}
                         displayKey="EmployeeName"
                         valueKey="_Id"
                         options={employeeList} // USE employeeList
                         onChange={(e) => storeDispatch(e, 'employeeId', 'select')} 
                         placeholder="Select Employee"
                    />

                    <div className="space-y-2 md:col-span-3">
                        <Label className="text-white">Address <span className="text-red-500">*</span></Label>
                        <Textarea value={state.visitorAddress} onChange={(e) => storeDispatch(e.target.value, "visitorAddress", "text")} className="bg-purple-900/50 border-fuchsia-700 text-white" placeholder="Enter address..." />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                         <Label className="text-white">Feedback</Label>
                         <Textarea value={state.feedback} onChange={(e) => storeDispatch(e.target.value, "feedback", "text")} className="bg-purple-900/50 border-fuchsia-700 text-white" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                         <Label className="text-white">Description</Label>
                         <Textarea value={state.description} onChange={(e) => storeDispatch(e.target.value, "description", "text")} className="bg-purple-900/50 border-fuchsia-700 text-white" />
                    </div>
                </CardContent>
                <div className="p-6 flex justify-end gap-4">
                    <Button onClick={Validate} disabled={loading} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold w-32">
                         {loading ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
                    </Button>
                </div>
            </Card>

            {/* SUB-SECTIONS (Follow Up / Plots) */}
            {(isEdit || (!state._id && !AddFollow)) && (
                <div className="space-y-4">
                    {isEdit && (
                        <Tabs value={OrderTab} onValueChange={setOrderTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                                <TabsTrigger value="Follow Up" className="data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white">Visitor Follow Up Details</TabsTrigger>
                                <TabsTrigger value="Plot Details" className="data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white">Visitor Plot Details</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    {isEdit && !AddFollow && (
                        <div className="flex justify-end">
                            <Button onClick={() => { setAddFollow(true); cleaerFollowUp(); clearPlot(); }} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
                                <Plus className="w-4 h-4 mr-2"/> Add {OrderTab}
                            </Button>
                        </div>
                    )}

                    {(!state._id || AddFollow) && (
                        <Card className="bg-slate-900/50 border-slate-800 animate-in fade-in zoom-in duration-300">
                            <CardHeader><CardTitle className="text-fuchsia-300 text-lg">{OrderTab === 'Follow Up' ? 'Add Follow Up' : 'Add Plot'}</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {OrderTab === 'Follow Up' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-white">Follow Up Date <span className="text-red-500">*</span></Label>
                                            <Input type="date" value={state.followUpDate} onChange={(e) => storeDispatch(e.target.value, 'followUpDate', 'text')} className="bg-purple-900/50 border-fuchsia-700 text-white" />
                                        </div>
                                        <GlassSelect 
                                            label="Assign Staff" value={state.followedUpByName || user.role === 'AGENT' ? user.EmployeeName : ''} 
                                            disabled={user.role !== 'Admin' && user.role !== 'Manager' && user.role !== 'SuperAdmin'}
                                            displayKey="EmployeeName" valueKey="_Id" 
                                            options={employeeList} 
                                            onChange={(e) => storeDispatch(e, 'followedUpById', 'select')} 
                                        />
                                        <GlassSelect label="Status" value={state.followUpStatus} displayKey="StatusName" valueKey="StatusName" options={Status} onChange={(e) => storeDispatch(e, 'FollowedUpStatus', 'select')} />
                                        <div className="col-span-3 grid grid-cols-3 gap-6">
                                            <div className="space-y-2"><Label className="text-white">Description</Label><Input value={state.followUpDescription} onChange={(e) => storeDispatch(e.target.value, 'followUpDescription', 'text')} className="bg-purple-900/50 border-fuchsia-700 text-white" /></div>
                                            <div className="space-y-2"><Label className="text-white">Notes <span className="text-red-500">*</span></Label><Input value={state.notes} onChange={(e) => storeDispatch(e.target.value, 'notes', 'text')} className="bg-purple-900/50 border-fuchsia-700 text-white" /></div>
                                            <div className="space-y-2"><Label className="text-white">Remarks</Label><Input value={state.remarks} onChange={(e) => storeDispatch(e.target.value, 'remarks', 'text')} className="bg-purple-900/50 border-fuchsia-700 text-white" /></div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                         <GlassSelect label="Site" value={state.sitename} displayKey="sitename" valueKey="_Id" options={siteList} onChange={(e) => storeDispatch(e, 'siteId', 'select')} />
                                         <GlassSelect label="Unit" value={state.UnitName} displayKey="UnitName" valueKey="_Id" options={unitList} onChange={(e) => storeDispatch(e, 'unitId', 'select')} />
                                         {!PlotEdit ? (
                                            <GlassSelect label="Plot Number" value={state.plotNumber} displayKey="plotNumber" valueKey="_Id" options={plotList} onChange={(e) => storeDispatch(e, 'plotId', 'select')}  />
                                         ) : (
                                             <div className="space-y-2"><Label className="text-white">Plot Number</Label><Input value={state.plotNumber} disabled className="bg-slate-800 border-fuchsia-700 text-gray-400" /></div>
                                         )}
                                         <GlassSelect label="Status" value={state.statusName} displayKey="statusName" valueKey="_Id" options={statusList} onChange={(e) => storeDispatch(e, 'statusId', 'select')} />
                                    </>
                                )}
                            </CardContent>
                            {isEdit && (
                                <div className="p-4 flex justify-end gap-2 bg-slate-800/50">
                                    <Button variant="ghost" onClick={() => setAddFollow(false)} className="text-white">Cancel</Button>
                                    <Button onClick={OrderTab === 'Follow Up' ? ValidateFollowUp : ValidatePlot} className="bg-fuchsia-600 text-white">Save Sub-Item</Button>
                                </div>
                            )}
                        </Card>
                    )}

                    {state._id && !AddFollow && (
                        <div className="overflow-x-auto rounded-lg border border-slate-700">
                           <table className="w-full bg-slate-900/80">
                                <thead className="bg-slate-800">
                                    <tr>
                                        {OrderTab === 'Follow Up' ? (
                                            <>
                                            <th className="p-3 text-left text-white text-sm">Date</th>
                                            <th className="p-3 text-left text-white text-sm">Status</th>
                                            <th className="p-3 text-left text-white text-sm">Notes</th>
                                            <th className="p-3 text-left text-white text-sm">Remarks</th>
                                            </>
                                        ) : (
                                            <>
                                            <th className="p-3 text-left text-white text-sm">Unit</th>
                                            <th className="p-3 text-left text-white text-sm">Plot No</th>
                                            <th className="p-3 text-left text-white text-sm">Status</th>
                                            </>
                                        )}
                                        <th className="p-3 text-right text-white text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(OrderTab === 'Follow Up' ? FollowUpDetails : PlotDetails).map((item, idx) => (
                                        <tr key={item._id || idx} className="border-t border-slate-700">
                                            {OrderTab === 'Follow Up' ? (
                                                <>
                                                <td className="p-3 text-slate-300 text-sm">{item.followUpDate?.split('T')[0].split('-').reverse().join('-')}</td>
                                                <td className="p-3"><Badge variant={item.followUpStatus === 'Pending' ? 'destructive' : 'default'} className={item.followUpStatus === 'Completed' ? 'bg-green-600' : ''}>{item.followUpStatus}</Badge></td>
                                                <td className="p-3 text-slate-300 text-sm">{item.notes}</td>
                                                <td className="p-3 text-slate-300 text-sm">{item.remarks}</td>
                                                </>
                                            ) : (
                                                <>
                                                 <td className="p-3 text-slate-300 text-sm">{item.plotId?.unitId?.UnitName}</td>
                                                 <td className="p-3 text-slate-300 text-sm">{item.plotId?.plotNumber}</td>
                                                 <td className="p-3"><Badge style={{backgroundColor: item.statusId?.colorCode || 'gray'}}>{item.statusId?.statusName}</Badge></td>
                                                </>
                                            )}
                                            <td className="p-3 flex justify-end gap-2">
                                                 <Button size="sm" variant="ghost" onClick={() => OrderTab === 'Follow Up' ? EditFollowup(item) : EditPlot(item)} className="h-8 w-8 p-0 text-yellow-500"><Edit className="w-4 h-4"/></Button>
                                                 <Button size="sm" variant="ghost" onClick={() => DeleteAlert(item)} className="h-8 w-8 p-0 text-red-500"><Trash2 className="w-4 h-4"/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    )}
                </div>
            )}
         </div>
        )}
      </div>
    </Loading>
  );
}