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
import { io } from "socket.io-client";
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
console.log(user,"user")
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const userNotifications = notifications.filter(
    (n) =>
      (n.toEmployeeId?._id || n.toEmployeeId) === user._id &&
      n.status === "unseen"
  );
  const { toast } = useToast();


  const markAsRead = async (notificationId) => {
    try {
      let url = config.Api + "Notifications/markAsSeen";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchNotifications();
        toast({
          title: "Marked as read",
          description: "Notification marked as seen.",
        });
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed",
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
      const EmployeeID = decode(localStorage.getItem("EmployeeId"))

      let url = config.Api + "Notifications/getNotifications"

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeId: EmployeeID }),
      });
      const data = await res.json();

      if (data?.data) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };


  const handleNotificationAction = async (notification, action) => {
    try {
      let url = config.Api + "Notifications/updateNotificationStatus"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification._id, action }),
      });

      if (res) {
        // Re-fetch updated notifications
        fetchNotifications();
        toast({ title: `Request ${action}d`, description: `The request has been ${action}d.` });
      } else {
        toast({ title: "Error", description: res.message, variant: "destructive" });
      }
    } catch (err) {
      console.error("Error updating notification:", err);
      toast({ title: "Error", description: "Failed to update notification.", variant: "destructive" });
    }
  };

 const handleClick = () =>{
 setShowNotifications((prev) => !prev);
              fetchNotifications();
 }




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
            onClick={handleClick}
          >
            <Bell className="w-5 h-5 text-purple-300" />

            {userNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5">
                {userNotifications.length}
              </span>
            )}
          </Button>

          {showNotifications && (
  <div className="  fixed
    right-1
    top-16
    z-[9999]
    w-[70vw]
    max-w-sm
    rounded-lg
    bg-slate-900
    border border-purple-700/50
    shadow-xl">
    <div className="p-3 font-semibold border-b border-purple-700/50">
      Notifications
    </div>

    <div className="max-h-72 overflow-y-auto">
      {userNotifications.length ? (
        userNotifications.map((n) => (
          <div key={n._id} className="p-3 text-sm border-b border-white/10">
            <p className="mb-2">{n.message}</p>

            {["permission-request", "leave-request", "task-complete"].includes(n.type) &&
            n.fromEmployeeId !== user?._id ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-500 h-7"
                  onClick={() => handleNotificationAction(n, "approve")}
                >
                  Approve
                </Button>

                <Button
                  size="sm"
                  className="bg-red-500 h-7"
                  onClick={() => handleNotificationAction(n, "reject")}
                >
                  Reject
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => markAsRead(n._id)}
              >
                Mark as read
              </Button>
            )}
          </div>
        ))
      ) : (
        <p className="p-4 text-center text-sm text-gray-400">
          No new notifications
        </p>
      )}
    </div>
  </div>
)}

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
