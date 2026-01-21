import React, { useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "../../components/ui/scrolltotop";
import FloatingCallButton from "../../components/ui/FloatingCallButton";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef(null);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1b0a2c] via-[#2a133b] to-[#3a1b4a] text-white mb-7">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0  z-20 md:hidden"
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main
          ref={scrollRef}
          className="md:flex-1 overflow-y-auto  scrollbar-hide "
        >
          <Outlet />
          <FloatingCallButton />
          {/* MOBILE SCROLL TO TOP */}
          <ScrollToTop containerRef={scrollRef} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
