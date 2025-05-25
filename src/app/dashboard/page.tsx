'use client';

import { useEffect, useState } from 'react';
import { getCustomers, getAccounts, getTransactions } from '@/lib/services/customerService';
import { FiUsers, FiCreditCard, FiDollarSign, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const refreshData = () => {
    setCustomers(getCustomers());
    setAccounts(getAccounts());
    setTransactions(getTransactions());
  };

  useEffect(() => {
        // Fetch localStorage data after component mounts (client-side)
    setCustomers(getCustomers());
    setAccounts(getAccounts());
    setTransactions(getTransactions());
// Initial data load
    refreshData();

    // Set up storage event listener for cross-tab updates
    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('storage', handleStorageChange);

    // Polling for changes (since storage event only works across tabs)
    const intervalId = setInterval(refreshData, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: <FiUsers className="text-2xl" />,
      color: 'bg-blue-100 text-blue-800',
      action: () => router.push('/dashboard/customers/new')
    },
    {
      title: 'Total Accounts',
      value: accounts.length || 0,
      icon: <FiCreditCard className="text-2xl" />,
      color: 'bg-green-100 text-green-800',
      action: () => router.push('/dashboard/accounts/new')
    },
    {
      title: 'Total Transactions',
      value: transactions.length,
      icon: <FiDollarSign className="text-2xl" />,
      color: 'bg-purple-100 text-purple-800',
      action: () => router.push('/dashboard/transactions/new')
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={stat.action}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-black">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
                <button 
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    stat.action();
                  }}
                >
                  <FiPlus className="text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 shadow-sm bg-white">
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
          <div className="space-y-3 text-black">
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
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">{customer.fullName.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{customer.fullName}</p>
                  <p className="text-sm text-gray-500">{customer.customerType}</p>
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-gray-500 text-sm">No customers found</p>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 shadow-sm bg-white">
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
                className="flex justify-between items-center text-black hover:bg-gray-50 p-2 rounded cursor-pointer"
                onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)}
              >
                <div>
                  <p className="font-medium">{transaction.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 text-sm rounded ${
                  transaction.status === 'Approved' 
                    ? 'bg-green-100 text-green-800' 
                    : transaction.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-500 text-sm">No transactions found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}