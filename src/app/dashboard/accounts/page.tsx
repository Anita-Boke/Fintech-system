// src/app/dashboard/accounts/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAccountsByCustomer } from '@/lib/services/accountService';
import { toast } from 'react-toastify';
import { Account } from '@/lib/constants';
import AccountList from '@/components/accounts/AccountList';
import { dummyAccounts, dummyCustomers } from '@/lib/constants';

// Helper functions
const getLocalStorageAccounts = (): Account[] => {
  if (typeof window !== 'undefined') {
    const storedAccounts = localStorage.getItem('accounts');
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  }
  return [];
};

export default function AccountsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const loadAccounts = async () => {
      try {
        setLoading(true);
        
        // Get accounts from localStorage
        const localStorageAccounts = getLocalStorageAccounts();
        
        // Find customer by email in both localStorage and dummy data
        const localStorageCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        const allCustomers = [...dummyCustomers, ...localStorageCustomers];
        const customer = allCustomers.find(c => c.email === session.user?.email);

        if (!customer) {
          toast.error('Customer not found');
          return;
        }

        // Get accounts from both sources
        const apiAccounts = await getAccountsByCustomer(customer.id);
        const customerAccounts = [...dummyAccounts, ...localStorageAccounts]
          .filter(acc => acc.customerId === customer.id);

        // Combine API accounts with local accounts
        setAccounts([...(apiAccounts || []), ...customerAccounts]);
        
      } catch (error) {
        console.error('Failed to load accounts:', error);
        toast.error('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">My Accounts</h1>
      <AccountList accounts={accounts} isAdmin={false} />
    </div>
  );
}