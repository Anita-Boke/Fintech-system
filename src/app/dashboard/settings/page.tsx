'use client';

import { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiLock, 
  FiBell, 
  FiCreditCard, 
  FiShield,
  FiMoon,
  FiSun,
  FiMonitor
} from 'react-icons/fi';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useTheme } from 'next-themes';

type NotificationPreference = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

type PrivacySettings = {
  analytics: boolean;
  personalizedAds: boolean;
  dataSharing: boolean;
};

type ProfileData = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type DashboardDensity = 'compact' | 'normal' | 'spacious';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<ProfileData>({
    name: 'John Doe',
    email: 'john@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState<NotificationPreference>({
    email: true,
    push: false,
    sms: false,
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    analytics: true,
    personalizedAds: false,
    dataSharing: false,
  });
  const [dashboardDensity, setDashboardDensity] = useState<DashboardDensity>('normal');
  const [isLoading, setIsLoading] = useState(true);
  const { theme, systemTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Load saved settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setFormData(prev => ({ ...prev, ...parsedSettings.formData }));
          setNotifications(parsedSettings.notifications || notifications);
          setPrivacySettings(parsedSettings.privacySettings || privacySettings);
          setDashboardDensity(parsedSettings.dashboardDensity || 'normal');
          setActiveTheme(parsedSettings.activeTheme || 'system');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (type: keyof NotificationPreference) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handlePrivacyChange = (setting: keyof PrivacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate password change if any password fields are filled
      if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (formData.newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
      }

      const settingsToSave = {
        formData,
        notifications,
        privacySettings,
        dashboardDensity,
        activeTheme
      };

      // In a real app, you would send this to your API
      localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Settings saved successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex space-x-6">
            <div className="w-48 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="flex-1 bg-white rounded-lg shadow p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings sidebar */}
        <div className="w-full md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {[
              { id: 'profile', icon: <FiUser />, label: 'Profile' },
              { id: 'security', icon: <FiLock />, label: 'Security' },
              { id: 'appearance', icon: <FiSun />, label: 'Appearance' },
              { id: 'notifications', icon: <FiBell />, label: 'Notifications' },
              { id: 'privacy', icon: <FiShield />, label: 'Privacy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-black dark:bg-blue-900 dark:text-blue-100' 
                    : 'text-black hover:bg-gray-100 dark:hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <FiUser />
                <span>Profile Settings</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <FiLock />
                <span>Security Settings</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <FiSun />
                <span>Appearance</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Theme Preferences
                  </h3>
                  <ThemeSwitcher 
                    activeTheme={activeTheme}
                    onThemeChange={(theme) => setActiveTheme(theme)}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Dashboard Display
                  </h3>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dashboard Density
                  </label>
                  <select 
                    value={dashboardDensity}
                    onChange={(e) => setDashboardDensity(e.target.value as DashboardDensity)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="spacious">Spacious</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {dashboardDensity === 'compact' && 'Show more content in less space'}
                    {dashboardDensity === 'normal' && 'Balanced spacing and content density'}
                    {dashboardDensity === 'spacious' && 'More whitespace for easier reading'}
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Appearance Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <FiBell />
                <span>Notification Preferences</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive important updates via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 dark:bg-gray-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Push Notifications
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get real-time alerts on your device
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 dark:bg-gray-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SMS Notifications
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive text messages for critical alerts
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 dark:bg-gray-600"></div>
                  </label>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <FiShield />
                <span>Privacy Settings</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Usage Analytics
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Help us improve by sharing anonymous usage data
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.analytics}
                      onChange={() => handlePrivacyChange('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 dark:bg-gray-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Personalized Advertising
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Show ads based on your activity and interests
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.personalizedAds}
                      onChange={() => handlePrivacyChange('personalizedAds')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 dark:bg-gray-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Data Sharing with Partners
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow sharing anonymized data with trusted partners
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataSharing}
                      onChange={() => handlePrivacyChange('dataSharing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 dark:bg-gray-600"></div>
                  </label>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Privacy Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}