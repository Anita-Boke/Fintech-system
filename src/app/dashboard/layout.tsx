'use client';
import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      
      <div className={`
        flex-1 overflow-auto transition-all duration-300 
        ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
      `}>
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}