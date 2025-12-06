
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarMUI from '@/components/SidebarMUI';
import DashboardTopNav from '@/components/DashboardTopNav';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isAIAssistant = location.pathname.includes('/ai-assistant');

  // Si estamos en AIAssistant, renderizar sin navbar y sin padding
  if (isAIAssistant) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-white">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] overflow-hidden transition-colors duration-300">
      <SidebarMUI isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <DashboardTopNav onMenuClick={() => setIsMobileOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
