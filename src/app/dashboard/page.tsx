'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FiUsers, FiCreditCard, FiDollarSign, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  getCustomerByUserId,
  getAccountsByCustomer,
} from '@/lib/services/customerService';
// Import services 
import {  getCustomerTransactions } from '@/lib/services/transactionService';


// Use the imported functions directly
// Remove your local function declarations and use the imported ones directly
interface Customer {
  id: string;
  fullName: string;
  customerType: string;
  profilePicture?: string;
}

interface Account {
  id: string;
  accountNumber: string;
  balance:number;
  userId?:string;
}

interface Transaction {
  id: unknown;
  accountId: string;
  type: string;
  date: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  toAccountId?:string;
  description:string;
}

// Helper function to safely fetch data

export default function DashboardPage() {
   const { data: session } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setCustomers(getCustomerByUserId());
        setAccounts(getAccountsByCustomer());
        setTransactions(getCustomerTransactions());
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  /*const refreshData = async () => {
    setIsLoading(true);
    try {
      // Use Promise.all for parallel requests with safeFetch wrapper
      const [customersData, accountsData, transactionsData] = await Promise.all([
        safeFetch(() => getCustomers()),
        safeFetch(() => getAccounts()),
        safeFetch(() => getTransactions())
      ]);

      setCustomers(customersData || []);
      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Only set interval in development for testing
    if (process.env.NODE_ENV === 'development') {
      const intervalId = setInterval(refreshData, 30000); // 30 seconds
      return () => clearInterval(intervalId);
    }
  }, []);*/

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Stats Cards */}
  {[
    {
      title: 'Customers',
      value: customers.length,
      icon: <FiUsers className="text-2xl text-blue-600" />,
      valueColor: 'text-blue-600',
      bgColor: 'bg-gray-100',
      iconBgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      action: () => router.push('/dashboard/customers/new')
    },
    {
      title: 'Accounts',
      value: accounts.length,
      icon: <FiCreditCard className="text-2xl text-green-600" />,
      valueColor: 'text-green-600',
      bgColor: 'bg-gray-100',
      iconBgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      action: () => router.push('/dashboard/accounts/new')
    },
    {
      title: 'Transactions',
      value: transactions.length,
      icon: <FiDollarSign className="text-2xl text-purple-600" />,
      valueColor: 'text-purple-600',
      bgColor: 'bg-gray-100',
      iconBgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      action: () => router.push('/dashboard/transactions/new')
    }
  ].map((stat, i) => (
    <div 
      key={i} 
      className={`border ${stat.borderColor} p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer hover:translate-y-[-2px] ${stat.bgColor}`}
      onClick={stat.action}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Total {stat.title}</p>
          <p className={`text-3xl font-bold ${stat.valueColor}`}>
            {stat.value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-full ${stat.iconBgColor}`}>
          {stat.icon}
        </div>
      </div>
    </div>
  ))}
</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black">Recent Customers</h2>
            <button 
              onClick={() => router.push('/dashboard/customers/new')}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              <FiPlus size={14} />
              <span>Add Customer</span>
            </button>
          </div>
          <div className="space-y-3">
            {customers.slice(0, 5).map(customer => (
              <div 
                key={customer.id} 
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer"
                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
              >
               {customer.profilePicture ? (
  <img 
    src={customer.profilePicture} 
    alt={customer.fullName}
    className="h-10 w-10 rounded-full object-cover"
    loading="lazy"
  />
) : (
  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
    <span className="text-gray-500 font-medium">{customer.fullName.charAt(0)}</span>
  </div>
)}
                <div>
                  <p className="font-medium text-black">{customer.fullName}</p>
                  <p className="text-sm text-gray-500">{customer.customerType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black">Recent Transactions</h2>
            <button 
              onClick={() => router.push('/dashboard/transactions/new')}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              <FiPlus size={14} />
              <span>Add Transaction</span>
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map(transaction => (
              <div 
                key={transaction.id} 
                className="flex justify-between items-center hover:bg-gray-50 p-2 rounded cursor-pointer"
                onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)}
              >
                <div>
                  <p className="font-medium text-black">{transaction.type}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 text-sm rounded ${
                  transaction.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                  transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getCustomerByUserId(): Promise<unknown> {
  throw new Error('Function not implemented.');
}


function getAccountsByCustomer(): Promise<unknown> {
  throw new Error('Function not implemented.');
}


function getCustomerTransactions(): Promise<unknown> {
  throw new Error('Function not implemented.');
}
