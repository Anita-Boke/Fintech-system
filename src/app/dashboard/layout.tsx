// src/app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { ThemeWrapper } from '@/contexts/ThemeContext';
import { GeistSans, GeistMono } from 'geist/font';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <ThemeWrapper>
        <div className="flex h-screen bg-gray-50">
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
      </ThemeWrapper>
    </div>
  );
}