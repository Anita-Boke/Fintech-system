'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">Theme</label>
          <p className="text-sm text-gray-500">Customize your application&apos;s appearance</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: 'light', icon: <FiSun className="w-5 h-5" />, label: 'Light' },
          { value: 'dark', icon: <FiMoon className="w-5 h-5" />, label: 'Dark' },
          { value: 'system', icon: <FiMonitor className="w-5 h-5" />, label: 'System' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
            className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
              theme === option.value
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {option.icon}
            <span className="mt-2 text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}