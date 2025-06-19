// src/components/accounts/AccountList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAccounts, deleteAccount } from '@/lib/services/accountService';
import { getCustomers } from '@/lib/services/customerService';
import AccountCard from './AccountCard';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AccountList() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        setAccounts(getAccounts());
        setCustomers(getCustomers());
      } catch (error) {
        toast.error('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    try {
      const updatedAccounts = deleteAccount(id);
      setAccounts(updatedAccounts);
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.fullName : 'Unknown Customer';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Accounts</h2>
        {session?.user?.role === 'admin' && (
          <Link 
            href="/dashboard/accounts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Add New Account
          </Link>
        )}
      </div>
      
      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-700">No accounts found</p>
          {session?.user?.role === 'admin' && (
            <Link 
              href="/dashboard/accounts/new"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Create your first account
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(account => (
            <AccountCard 
              key={account.id} 
              account={{
                ...account,
                customerName: getCustomerName(account.customerId)
              }}
              onDelete={session?.user?.role === 'admin' ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}