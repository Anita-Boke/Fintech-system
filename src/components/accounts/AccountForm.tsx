/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getAccount, updateAccount, getAccountById } from '@/lib/services/accountService';
import { getCustomers } from '@/lib/services/customerService';
import Link from 'next/link';

// Add localStorage helper functions
const getLocalStorageAccounts = (): any[] => {
  if (typeof window !== 'undefined') {
    const storedAccounts = localStorage.getItem('accounts');
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  }
  return [];
};

const saveLocalStorageAccounts = (accounts: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
};

export default function AccountForm({ accountId }: { accountId?: string }) {
  const router = useRouter();
  const [customers, setCustomers] = useState(getCustomers());
  const [formData, setFormData] = useState({
    customerId: '',
    accountType: 'Savings',
    balance: 0,
    status: 'Active'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (accountId) {
      // Check localStorage first, then fallback to API/dummy data
      const localStorageAccounts = getLocalStorageAccounts();
      const localAccount = localStorageAccounts.find((acc: any) => acc.id === accountId);
      if (localAccount) {
        setFormData(localAccount);
      } else {
        const account = getAccountById(accountId);
        if (account) setFormData(account);
      }
    }
    setCustomers(getCustomers());
  }, [accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const localStorageAccounts = getLocalStorageAccounts();
      
      if (accountId) {
        // Update account in localStorage
        const updatedAccounts = localStorageAccounts.map((acc: any) => 
          acc.id === accountId ? { ...acc, ...formData } : acc
        );
        saveLocalStorageAccounts(updatedAccounts);
        
        // Still call the API service if needed
        updateAccount(accountId, formData);
        toast.success('Account updated successfully');
      } else {
        // Create new account with generated ID
        const newAccount = {
          ...formData,
          id: `acc-${Date.now()}`,
          openingDate: new Date().toISOString()
        };
        
        // Save to localStorage
        saveLocalStorageAccounts([...localStorageAccounts, newAccount]);
        
        // Still call the API service if needed
        getAccount(formData);
        toast.success('Account created successfully');
      }
      
      router.push('/dashboard/accounts');
    } catch (error) {
      toast.error('Error saving account');
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your existing JSX remains exactly the same
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {accountId ? 'Edit Account' : 'Create New Account'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <select
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={!!accountId}
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName} ({customer.customerType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <select
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Savings">Savings</option>
            <option value="Checking">Checking</option>
            <option value="Business">Business</option>
          </select>
        </div>

        {!accountId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              step="0.01"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/dashboard/accounts"
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : accountId ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}