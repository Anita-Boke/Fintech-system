'use client';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const title = pathname.split('/').pop() || 'Dashboard';
  
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold capitalize text-black">
          {title === 'dashboard' ? 'Overview' : title.replace('-', ' ')}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-black font-semibold">AD</span>
          </div>
        </div>
      </div>
    </header>
  );
}