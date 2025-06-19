'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getUserById } from '@/lib/services/userService';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getCustomerByUserId } from '@/lib/services/customerService';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAllAccounts, getAccountsByCustomer } from '@/lib/services/accountService';
import { toast } from 'react-toastify';
import { Account } from '@/lib/constants';
import AccountList from '@/components/accounts/AccountList';
import { dummyAccounts, dummyCustomers } from '@/lib/constants';

export default function AccountsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadAccounts = async () => {
      try {
        setLoading(true);
        
        // Get user role
        const user = await getUserById(session.user.id);
        const isAdmin = user?.role === 'admin';

        // Always use dummy data for this implementation
        if (isAdmin) {
          setAccounts(dummyAccounts);
        } else {
          // Find the customer that matches the logged-in user's email
          const customerData = dummyCustomers.find(c => c.email === session.user?.email) || dummyCustomers[0];
          setAccounts(dummyAccounts.filter(acc => acc.customerId === customerData.id));
        }
        setLoading(false);

      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred');
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
      <AccountList 
        accounts={accounts} 
        isAdmin={session?.user?.role === 'admin'} 
      />
    </div>
  );
}