import React, { useState,useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ScrollToTop from '../../components/ui/scrolltotop';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef(null); 

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1b0a2c] via-[#2a133b] to-[#3a1b4a] text-white">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="md:flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main  ref={scrollRef} className="md:flex-1 overflow-y-auto p-3 md:p-6 scrollbar-hide ">
          <Outlet />
          
          {/* MOBILE SCROLL TO TOP */}
          <ScrollToTop containerRef={scrollRef} />
        </main>
      </div>
    </div>
  );
}