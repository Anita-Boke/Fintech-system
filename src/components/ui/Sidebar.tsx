// src/components/ui/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  FiHome, 
  FiUsers, 
  FiCreditCard, 
  FiDollarSign,
  //FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiLogOut
} from 'react-icons/fi';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  // Define navigation items
  const navItems = [
    { href: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { href: '/dashboard/customers', icon: <FiUsers />, label: 'Customers' },
    { href: '/dashboard/accounts', icon: <FiCreditCard />, label: 'Accounts' },
    { href: '/dashboard/transactions', icon: <FiDollarSign />, label: 'Transactions' },
   // { href: '/dashboard/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-purple-800 text-white shadow-md"
        onClick={toggleMobileSidebar}
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar */}
      <div
  className={`
    fixed md:relative h-full bg-purple-800 text-white transition-all duration-300 ease-in-out
    ${isCollapsed ? 'w-20' : 'w-64'}
    ${isMobileOpen ? 'left-0' : '-left-full md:left-0'}
    z-40 rounded-r-xl backdrop-blur-md border-r border-purple-600/30
  `}
>
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && <h1 className="text-xl font-bold">Fintech System</h1>}
          <button
            onClick={toggleSidebar}
            className="hidden md:block p-2 rounded-md hover:bg-purpble-200"
          >
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center p-3 rounded-md transition-colors
                ${pathname === item.href ? 'bg-gray-700' : 'hover:bg-gray-700'}
                ${isCollapsed ? 'justify-center' : 'space-x-3'}
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`
              flex items-center p-3 rounded-md transition-colors w-full
              hover:bg-gray-700
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
          >
            <span className="text-lg"><FiLogOut /></span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Mobile collapse button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden absolute bottom-16 right-4 p-2 rounded-md bg-gray-700"
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
  <div
    className="fixed inset-0 bg-black z-30 md:hidden"
    onClick={() => setIsMobileOpen(false)}
  />
)}
    </>
  );
}