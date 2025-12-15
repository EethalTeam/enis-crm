import React, { createContext, useContext, useState, useEffect } from 'react';
// import { initialData } from '@/data/mockData';
// import useCrud from '@/hooks/useCrud';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest'
import { config } from '@/components/CustomComponents/config.js';


const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// const getInitialData = (key, mockData) => {
//   try {
//     const storedData = localStorage.getItem(key);
//     if (storedData) {
//       return JSON.parse(storedData);
//     }
//     localStorage.setItem(key, JSON.stringify(mockData));
//     return mockData;
//   } catch (error) {
//     console.error(`Error reading from localStorage for key "${key}":`, error);
//     return mockData;
//   }
// };

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage for key "${key}":`, error);
  }
};


export const DataProvider = ({ children }) => {
  const { user } = useAuth();

//   const { 
//     state: employees, 
//     add: addEmployee, 
//     update: updateEmployee, 
//     remove: deleteEmployee 
//   } = useCrud('hrms_employees', initialData.employees);
  
//   const { 
//     state: departments, 
//     add: addDepartment,
//     update: updateDepartment,
//     remove: deleteDepartment
//   } = useCrud('hrms_departments', initialData.departments);

//   const { 
//     state: designations, 
//     add: addDesignation,
//     update: updateDesignation,
//     remove: deleteDesignation
//   } = useCrud('hrms_designations', initialData.designations);

//   const { 
//     state: projects, 
//     add: addProject, 
//     update: updateProject, 
//     remove: deleteProject 
//   } = useCrud('hrms_projects', initialData.projects);

//   const { 
//     state: tasks, 
//     add: addTask, 
//     update: updateTask, 
//     remove: deleteTask 
//   } = useCrud('hrms_tasks', initialData.tasks);

//   const { 
//     state: shifts, 
//     add: addShift, 
//     update: updateShift, 
//     remove: deleteShift 
//   } = useCrud('hrms_shifts', initialData.shifts);

//   const { 
//     state: earnings, 
//     add: addEarning, 
//     update: updateEarning, 
//     remove: deleteEarning 
//   } = useCrud('hrms_earnings', initialData.earnings);

//   const { 
//     state: deductions, 
//     add: addDeduction, 
//     update: updateDeduction, 
//     remove: deleteDeduction 
//   } = useCrud('hrms_deductions', initialData.deductions);
  
//   const { 
//     state: timesheetEntries, 
//     add: addTimesheetEntry, 
//     update: updateTimesheetEntry, 
//     remove: deleteTimesheetEntry 
//   } = useCrud('hrms_timesheets', initialData.timesheetEntries);

//   const { 
//     state: leads, 
//     add: addLead, 
//     update: updateLead, 
//     remove: deleteLead 
//   } = useCrud('hrms_leads', initialData.leads);
  
//   const { 
//     state: leaves, 
//     add: addLeave, 
//     update: updateLeave, 
//     remove: deleteLeave 
//   } = useCrud('hrms_leaves', initialData.leaves);

//   const { 
//     state: permissionsCrud, 
//     add: addPermissionCrud, 
//     update: updatePermissionCrud, 
//     remove: deletePermission 
//   } = useCrud('hrms_permissions_requests', initialData.permissions);

//   const { 
//     state: attendance, 
//     add: addAttendance, 
//     update: updateAttendance, 
//     remove: deleteAttendance 
//   } = useCrud('hrms_attendance', initialData.attendance);

//   const { 
//     state: tickets, 
//     add: addTicket, 
//     update: updateTicket, 
//     remove: deleteTicket 
//   } = useCrud('hrms_tickets', initialData.tickets);
  
//   const { 
//     state: finances, 
//     add: addFinance, 
//     update: updateFinance, 
//     remove: deleteFinance 
//   } = useCrud('hrms_finances', initialData.finances);

//   const {
//     state: notifications,
//     add: addNotification,
//     update: updateNotification,
//   } = useCrud('hrms_notifications', initialData.notifications);

//   const {
//     // state: roles,
//     add: addRole,
//     update: updateRole,
//     remove: deleteRole,
//   } = useCrud('hrms_roles', initialData.roles);

  // const [menuPermissions, setMenuPermissions] = useState(() => getInitialData('hrms_permissions', initialData.menuPermissions));
//   const [attendanceStatus, setAttendanceStatus] = useState(() => getInitialData('hrms_attendance_status', { status: 'out', break: false }) || { status: 'out', break: false });
  const [roles,setRoles]=useState([])
  const [menuPermissions,setMenuPermissions]=useState({})
  console.log(menuPermissions,"menuPermissions")
  useEffect(()=>{
    getRole()
  },[])
useEffect(()=>{
let rolepath=roles.reduce((acc,curr)=>{
  if(!acc[curr.RoleName]){
return {...acc,[curr.RoleName]:curr.permissions.map(val=>val.menuDetails.path)}
  }else{
return acc
  }
},{})
setMenuPermissions(rolepath)
},[roles])
const getRole = async () => {
  try {
    // const response = await apiRequest("RoleBased/getAllRoles", {
    //     method: 'POST',
    //     body: JSON.stringify({}),
    //   });
          let url = config.Api + "RoleBased/getAllRoles"; 
                const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                if (!response.ok) throw new Error('Failed to get Menus');
                const result = await response.json();
                const data = result.data || result; 
    setRoles(data || []);
  } catch (error) {
    console.error("Failed to fetch roles", error);
    setRoles([]);
  }
};
//   useEffect(() => {
//     saveData('hrms_attendance_status', attendanceStatus);
//   }, [attendanceStatus]);

  const updatePermissions = (newPermissions) => {
    setMenuPermissions(newPermissions);
    saveData('hrms_permissions', newPermissions);
  };

//   const addPermissionRequest = (permissionData) => {
//     const newPermission = addPermissionCrud(permissionData);
//     const requester = employees.find(e => e.id === newPermission.employeeId);
//     const admins = employees.filter(e => e.role === 'Admin' || e.role === 'Super Admin');
    
//     admins.forEach(admin => {
//       addNotification({
//         recipientId: admin.id,
//         message: `${requester.name} has requested permission for ${newPermission.hours} hour(s) on ${newPermission.date}.`,
//         type: 'permission_request',
//         entityId: newPermission.id,
//         read: false,
//         metadata: { requesterId: requester.id }
//       });
//     });
//   };

//   const updatePermissionRequest = (permissionData) => {
//     const originalPermission = permissionsCrud.find(p => p.id === permissionData.id);
//     const updated = updatePermissionCrud(permissionData);
    
//     if (originalPermission.status !== updated.status) {
//       const requester = employees.find(e => e.id === updated.employeeId);
//       addNotification({
//         recipientId: requester.id,
//         message: `Your permission request for ${updated.date} has been ${updated.status}.`,
//         type: 'permission_status',
//         entityId: updated.id,
//         read: false,
//         metadata: {}
//       });
//     }
//     return updated;
//   };

//   const addPayrollComponent = (type, component) => {
//     if (type === 'earnings') addEarning(component);
//     else addDeduction(component);
//   };
//   const updatePayrollComponent = (type, component) => {
//     if (type === 'earnings') updateEarning(component);
//     else updateDeduction(component);
//   };
//   const deletePayrollComponent = (type, componentId) => {
//     if (type === 'earnings') deleteEarning(componentId);
//     else deleteDeduction(componentId);
//   };

  const value = {
    // employees, addEmployee, updateEmployee, deleteEmployee,
    // departments, addDepartment, updateDepartment, deleteDepartment,
    // designations, addDesignation, updateDesignation, deleteDesignation,
    // projects, addProject, updateProject, deleteProject,
    // tasks, addTask, updateTask, deleteTask,
    // shifts, addShift, updateShift, deleteShift,
    // earnings,
    // deductions,
    // addPayrollComponent, updatePayrollComponent, deletePayrollComponent,
    // timesheetEntries, addTimesheetEntry, updateTimesheetEntry, deleteTimesheetEntry,
    // leads, addLead, updateLead, deleteLead,
    // leaves, addLeave, updateLeave, deleteLeave,
    // permissions: permissionsCrud, addPermission: addPermissionRequest, updatePermission: updatePermissionRequest, deletePermission,
    // attendance, addAttendance, updateAttendance, deleteAttendance,
    // tickets, addTicket, updateTicket, deleteTicket,
    // finances, addFinance, updateFinance, deleteFinance,
    // notifications, addNotification, updateNotification,
    // roles, addRole, updateRole, deleteRole,
    menuPermissions, updatePermissions,
    // attendanceStatus, setAttendanceStatus,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};