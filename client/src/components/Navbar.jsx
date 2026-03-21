import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../app/features/authSlice";
import { BellIcon, CheckCircle2Icon } from "lucide-react";
import api from "../configs/api";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user && user._id) {
      const token = localStorage.getItem("token");
      
      // Fetch initial notifications
      api.get("/api/notifications/get", { headers: { Authorization: token } })
        .then(res => {
           if (res.data && res.data.notifications) {
             setNotifications(res.data.notifications);
           }
        })
        .catch(err => console.error("Error fetching notifications:", err));

      // Setup WebSocket
      const socketUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
      const socket = io(socketUrl);
      
      socket.emit("join", user._id);

      socket.on("new_notification", (notif) => {
        setNotifications(prev => [notif, ...prev]);
        toast.success(notif.message, {
          icon: '👀',
          duration: 6000,
          style: {
            borderRadius: '10px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #3b82f6',
          },
        });
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put("/api/notifications/mark-read", {}, { headers: { Authorization: token } });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const logoutUser = () => {
    navigate("/");
    dispatch(logout());
  };

  return (
    <div className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800">
      {/* Navigation container: Ensures max width and centers content. */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-100 transition-all">
        {/* Logo Link: Always redirects to the home page (/). */}
        <Link to="/">
          <span className="font-bold text-xl drop-shadow-sm">
            Resume<span className="text-blue-500">Forge</span>
          </span>
        </Link>

        {/* User Info and Action Buttons */}
        <div className="flex items-center gap-4 text-sm relative">
          
          {/* Notification Bell Dropdown */}
          <div className="relative">
             <button 
               onClick={() => setShowNotifMenu(!showNotifMenu)} 
               className="p-2 rounded-full hover:bg-slate-800 transition relative text-slate-300"
             >
               <BellIcon className="size-5" />
               {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 flex size-2.5 rounded-full bg-red-500 border-2 border-[#0B0F19]"></span>}
             </button>
             
             {showNotifMenu && (
               <div className="absolute right-0 mt-3 w-80 bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-md">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/80">
                     <p className="font-semibold text-slate-200">Notifications</p>
                     {unreadCount > 0 && (
                       <button onClick={handleMarkAllRead} className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded">
                         <CheckCircle2Icon className="size-3" /> Mark all read
                       </button>
                     )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-slate-900/40">
                     {notifications.length === 0 ? (
                       <div className="px-4 py-8 flex flex-col items-center justify-center text-slate-500">
                         <BellIcon className="size-8 opacity-20 mb-2" />
                         <p className="text-sm">No new notifications.</p>
                       </div>
                     ) : (
                       notifications.map(notif => (
                         <div key={notif._id} className={`px-4 py-3 border-b border-slate-800/50 flex flex-col gap-1 transition-colors hover:bg-slate-700/20 ${!notif.isRead ? 'bg-blue-900/10' : 'opacity-70'}`}>
                           <p className="text-sm text-slate-200">{notif.message}</p>
                           <p className="text-[10px] text-slate-500">{new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                       ))
                     )}
                  </div>
               </div>
             )}
          </div>

          {/* User Greeting: Dynamically displays the user's name (hidden on small screens). */}
          <p className="max-sm:hidden font-medium text-slate-300">Hi, {user?.name}</p>

          {/* Logout Button: Triggers the logout handler */}
          <button
            onClick={logoutUser}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-7 py-1.5 rounded-full active:scale-95 transition-all hover:border-slate-500 shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
