'use client';

import { getAccounts, deleteAccount } from '@/lib/services/accountService';
import { getCustomers } from '@/lib/services/customerService';
import AccountCard from './AccountCard';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AccountList() {
  const [accounts, setAccounts] = useState(getAccounts());
  const [customers, setCustomers] = useState(getCustomers());

  const handleDelete = (id: string) => {
    const updatedAccounts = deleteAccount(id);
    setAccounts(updatedAccounts);
    toast.success('Account deleted successfully');
  };

  useEffect(() => {
    setAccounts(getAccounts());
    setCustomers(getCustomers());
  }, []);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.fullName : 'Unknown Customer';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">All Accounts</h2>
        <Link 
          href="/dashboard/accounts/new"
          className="bg-primary text-black px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Add New Account
        </Link>
      </div>
      
      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-700">No accounts found</p>
          <Link 
            href="/dashboard/accounts/new"
            className="text-primary hover:underline mt-2 inline-block"
          >
            Create your first account
          </Link>
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
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}