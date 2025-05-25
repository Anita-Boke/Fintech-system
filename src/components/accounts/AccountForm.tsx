'use client';

import { useState, useEffect } from 'react';
import { Account } from '@/lib/constants';
import { saveAccount, updateAccount, getAccountById } from '@/lib/services/accountService';
import { getCustomers } from '@/lib/services/customerService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface AccountFormProps {
  accountId?: string;
}

export default function AccountForm({ accountId }: AccountFormProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(getCustomers());
  const [formData, setFormData] = useState<Partial<Account>>({
    customerId: '',
    accountType: 'Savings',
    balance: 0,
    status: 'Active'
  });

  useEffect(() => {
    if (accountId) {
      const account = getAccountById(accountId);
      if (account) setFormData(account);
    }
  }, [accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (accountId && formData.id) {
        await updateAccount(accountId, formData);
        toast.success('Account updated successfully');
      } else {
        await saveAccount({
          customerId: formData.customerId || '',
          accountType: formData.accountType || 'Savings',
          balance: formData.balance || 0,
          status: formData.status || 'Active'
        });
        toast.success('Account created successfully');
      }
      router.push('/dashboard/accounts');
    } catch (error) {
      toast.error('Error saving account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-black">
        {accountId ? 'Edit Account' : 'Create New Account'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <select
            value={formData.customerId || ''}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            className="w-full p-2 border  border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
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
            value={formData.accountType || 'Savings'}
            onChange={(e) => setFormData({ 
              ...formData, 
              accountType: e.target.value as 'Savings' | 'Checking' | 'Business' 
            })}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 "
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
              value={formData.balance || 0}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
              required
              min="0"
              step="0.01"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status || 'Active'}
            onChange={(e) => setFormData({ 
              ...formData, 
              status: e.target.value as 'Active' | 'Suspended' | 'Closed' 
            })}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
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
            className="px-4 py-2 border rounded text-black hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="bg-primary text-black px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            {accountId ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}