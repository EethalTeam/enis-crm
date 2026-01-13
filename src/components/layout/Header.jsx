import React from "react";
import { Search, Bell, Menu, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { config } from "@/components/CustomComponents/config.js";
const decode = (value) => {
    if (!value) return "";
    try {
      return atob(value); // DECRYPT
    } catch {
      return "";
    }
  };

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userNotifications = notifications.filter(
    (n) =>
      (n.toEmployeeId?._id || n.toEmployeeId) === user._id &&
      n.status === "unseen"
  );
  const { toast } = useToast();
 

  const markAsRead = async (notificationId) => {
    try {
       let url = config.Api + "Notifications/markAsSeen/";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (res) {
        // Re-fetch updated notifications
        fetchNotifications();
        toast({
          title: "Marked as read",
          description: "Notification marked as seen.",
        });
      } else {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error marking notification:", err);
      toast({
        title: "Error",
        description: "Failed to mark notification as seen.",
        variant: "destructive",
      });
    }
  };

  const fetchNotifications = async () => {
    
    try { 
        const EmployeeID =  decode(localStorage.getItem("EmployeeId"))
        
       let url = config.Api + "Notifications/getNotifications"
       
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeId: EmployeeID }),
      });
      const data = res;
      if (data?.data) setNotifications(data.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <header className="relative z-30  bg-transparent px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center  flex-1">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="w-5 h-5 text-slate-300" />
          </Button>

          {/* <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 invisible" />
            <Input
              placeholder="Search anything..."
              className=" glass-card bg-slate-900/50 border-purple-700/50 text-white placeholder:text-slate-500 invisible"
            />
          </div> */}
        </div>

        <div className="flex items-center ">
          {/* <Button variant="ghost" size="icon">
            <Sun className="w-5 h-5 text-purple-300 invisible" />
          </Button> */}

          {/* <Button variant="ghost" size="icon" className="relative ">
            <Bell className="w-5 h-5 text-purple-300 " />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full animate-pulse"></span>
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              setOpen((prev) => !prev);   // open immediately
              if (!open) fetchNotifications(); // fetch only when opening
            }}
          >
            <Bell className="w-5 h-5 text-purple-300" />

            {userNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5">
                {userNotifications.length}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="
        absolute z-auto top-14
        bg-gradient-to-b from-slate-900 to-slate-600
        border border-purple-700/40 rounded-xl shadow-2xl

        left-1/2 -translate-x-1/2 w-72
        md:left-auto md:right-14 md:translate-x-0 md:w-96
      "
              >
                {/* HEADER */}
                <div className="px-4 py-3 border-b border-purple-700/40 text-white font-semibold">
                  Notifications
                </div>

                {/* BODY */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-400 py-6">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`px-4 py-3 border-b border-purple-700/20 text-sm cursor-pointer transition ${n.status === "seen"
                            ? "text-slate-400"
                            : "text-white bg-purple-900/20 hover:bg-purple-900/40"
                          }`}
                      >
                        {n.message}
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>






          <div className="flex items-start gap-3 pl-3 border-l border-purple-700/50">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5 text-purple-300" />
              </Button>
            </motion.div>
            <div className=" ">
              <p className="text-sm font-medium text-white">
                {user?.EmployeeName}
              </p>
              <p className="text-xs text-purple-400">{user?.role}</p>
            </div>

            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>🧑‍💼</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
