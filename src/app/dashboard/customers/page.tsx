'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getUserById } from '@/lib/services/userService';
import { 
  getCustomerByUserId,
  getAccountsByCustomer,
  getCustomers,
} from '@/lib/services/customerService';
import { getAllAccounts } from '@/lib/services/accountService';
import { getAllTransactions, getCustomerTransactions } from '@/lib/services/transactionService';
import { Customer, Account, Transaction } from '@/lib/constants';
import AccountCard from '@/components/accounts/AccountCard';
import TransactionTable from '@/components/transactions/TransactionTable';
import { toast } from 'react-toastify';

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get user role
        const user = await getUserById(session.user.id);
        const isAdmin = user?.role === 'admin';
        
        if (isAdmin) {
          // Admin sees all data
          const [allCustomers, allAccounts, allTransactions] = await Promise.all([
            getCustomers(),
            getAllAccounts(),
            getAllTransactions()
          ]);
          setCustomer(allCustomers[0]); // Just for demo
          setAccounts(allAccounts);
          setTransactions(allTransactions);
        } else {
          // Customer sees only their data
          const customerData = await getCustomerByUserId(session.user.id);
          if (!customerData) {
            toast.error('Customer not found');
            return;
          }
          
          setCustomer(customerData);
          
          // Get customer accounts
          const customerAccounts = await getAccountsByCustomer(customerData.id);
          setAccounts(customerAccounts);
          
          // Get customer transactions
          const customerTransactions = await getCustomerTransactions(customerData.id);
          setTransactions(customerTransactions);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Customer Not Found</h1>
        <p className='text-black'> No customer information available.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {customer.fullName}</h1>
      
      {/* Customer Profile Section */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email: {customer.email}</p>
            <p className="text-gray-600">Phone: {customer.phone}</p>
          </div>
          <div>
            <p className="text-gray-600">Customer Type: {customer.customerType}</p>
            <p className="text-gray-600">Member Since: {new Date(customer.dateOfRegistration).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {/* Accounts Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-gray-600">No accounts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => (
              <AccountCard 
                key={account.id} 
                account={account}
                onDelete={() => {}} // Customers can't delete accounts
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Transactions Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-600">No transactions found.</p>
        ) : (
          <TransactionTable 
            transactions={transactions}
            onStatusChange={() => {}} // Customers can't change status
            isAdmin={false}
          />
        )}
      </div>
    </div>
  );
}