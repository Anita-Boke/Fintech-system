// src/app/dashboard/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAllCustomers } from '@/lib/services/customerService';
import { getAllAccounts } from '@/lib/services/accountService';
import { Customer, Account } from '@/lib/constants';
import CustomerTable from '@/components/customers/CustomerTable';
import AccountTable from '@/components/accounts/AccountTable';
import { toast } from 'react-toastify';


export default function AdminDashboard() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        const [allCustomers, allAccounts] = await Promise.all([
          getAllCustomers(),
          getAllAccounts()
        ]);
        
        setCustomers(allCustomers);
        setAccounts(allAccounts);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Admin Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">All Customers</h2>
        <CustomerTable customers={customers} />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-black">All Accounts</h2>
        <AccountTable accounts={accounts} />
      </div>
    </div>
  );
}