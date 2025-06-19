// src/components/accounts/AccountList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAccounts, deleteAccount } from '@/lib/services/accountService';
import { getCustomers } from '@/lib/services/customerService';
import AccountCard from './AccountCard';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Account, Customer, AccountWithCustomer } from '@/lib/constants';

export default function AccountList() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsData, customersData] = await Promise.all([
          getAccounts(),
          getCustomers()
        ]);
        setAccounts(accountsData);
        setCustomers(customersData);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      const updatedAccounts = await deleteAccount(id);
      setAccounts(updatedAccounts);
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
      console.error(error);
    }
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.fullName : 'Unknown Customer';
  };

  const getAccountWithCustomer = (account: Account): AccountWithCustomer => {
    return {
      ...account,
      customerName: getCustomerName(account.customerId)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Accounts</h2>
        {session?.user?.role === 'admin' && (
          <Link
            href="/dashboard/accounts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Account
          </Link>
        )}
      </div>
      
      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No accounts found</p>
          {session?.user?.role === 'admin' && (
            <Link
              href="/dashboard/accounts/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first account
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={getAccountWithCustomer(account)}
              onDelete={session?.user?.role === 'admin' ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}