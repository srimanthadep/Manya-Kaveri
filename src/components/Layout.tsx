import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export const Layout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080808] text-[#E0E0E0] relative overflow-x-hidden">
      {/* Subtle ambient lighting for Bento depth */}
      <div className="fixed top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/[0.03] blur-[140px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <TopHeader onMobileMenuToggle={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

