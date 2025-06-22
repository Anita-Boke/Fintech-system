'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAccounts, deleteAccount, getAccountsByCustomer } from '@/lib/services/accountService';
import { getCustomers, getCustomerByUserId } from '@/lib/services/customerService';
import AccountCard from '@/components/accounts/AccountCard';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Account, Customer, AccountWithCustomer } from '@/lib/constants';
import { dummyAccounts, dummyCustomers } from '@/lib/constants';

// LocalStorage helper functions
const getLocalStorageAccounts = (): Account[] => {
  if (typeof window !== 'undefined') {
    const storedAccounts = localStorage.getItem('accounts');
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  }
  return [];
};

const saveLocalStorageAccounts = (accounts: Account[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
};

export default function AccountList() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Load all customers (for customer names)
        const customersData = await getCustomers();
        setCustomers([...customersData, ...dummyCustomers]);

        // 2. Get accounts from localStorage
        const localStorageAccounts = getLocalStorageAccounts();

        // 3. Handle accounts based on user role
        if (session?.user?.role === 'admin') {
          // Admin sees all accounts from all sources
          try {
            const apiAccounts = await getAccounts();
            setAccounts([...apiAccounts, ...localStorageAccounts, ...dummyAccounts]);
          } catch (apiError) {
            console.error('API failed, using local data:', apiError);
            setAccounts([...localStorageAccounts, ...dummyAccounts]);
          }
        } else {
          // Regular customer sees only their accounts
          try {
            // Find customer by email in both localStorage and dummy data
            const localStorageCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
            const allCustomers = [...dummyCustomers, ...localStorageCustomers];
            const customer = allCustomers.find(c => c.email === session?.user?.email);

            if (customer) {
              // Get accounts from all sources for this customer
              const apiAccounts = await getAccountsByCustomer(customer.id);
              const localAccounts = localStorageAccounts.filter(acc => acc.customerId === customer.id);
              const dummyCustomerAccounts = dummyAccounts.filter(acc => acc.customerId === customer.id);
              
              setAccounts([...apiAccounts, ...localAccounts, ...dummyCustomerAccounts]);
            } else {
              toast.error('Customer profile not found');
              setAccounts([]);
            }
          } catch (apiError) {
            console.error('API failed, using local data:', apiError);
            // Fallback to dummy customer data
            const dummyCustomer = dummyCustomers.find(c => c.email === session?.user?.email);
            if (dummyCustomer) {
              const localAccounts = localStorageAccounts.filter(acc => acc.customerId === dummyCustomer.id);
              const dummyCustomerAccounts = dummyAccounts.filter(acc => acc.customerId === dummyCustomer.id);
              setAccounts([...localAccounts, ...dummyCustomerAccounts]);
            } else {
              setAccounts([]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      loadData();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      // Delete from localStorage
      const localStorageAccounts = getLocalStorageAccounts();
      const updatedLocalAccounts = localStorageAccounts.filter(acc => acc.id !== id);
      saveLocalStorageAccounts(updatedLocalAccounts);
      
      // Delete from API if needed
      const updatedAccounts = await deleteAccount(id);
      
      // Update state with remaining accounts
      setAccounts(prev => [
        ...updatedAccounts,
        ...prev.filter(acc => acc.id !== id && !updatedLocalAccounts.some(la => la.id === acc.id))
      ]);
      
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
        <h2 className="text-2xl font-bold text-gray-800">
          {session?.user?.role === 'admin' ? 'All Accounts' : 'My Accounts'}
        </h2>
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