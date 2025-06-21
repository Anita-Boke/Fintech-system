'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FiUsers, FiCreditCard, FiDollarSign, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  getCustomerByUserId,
  getAccountsByCustomer,
  getCustomers,
} from '@/lib/services/customerService';
import { 
  getCustomerTransactions,
  getAllTransactions,
} from '@/lib/services/transactionService';
import { 
  getAllAccounts 
} from '@/lib/services/accountService';
import {
  dummyCustomers,
  dummyAccounts,
  dummyTransactions,
  Customer,
  Account,
  Transaction
} from '@/lib/constants';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAdmin = session?.user?.role === 'admin';
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (!userId || !userEmail) return;

        if (process.env.NODE_ENV === 'development') {
          // Use dummy data in development
          if (isAdmin) {
            setCustomers(dummyCustomers);
            setAccounts(dummyAccounts);
            setTransactions(dummyTransactions);
          } else {
            // Find customer by logged-in user's email
            const customerData = dummyCustomers.find(c => c.email === userEmail);
            if (customerData) {
              setCustomers([customerData]);
              setAccounts(dummyAccounts.filter(acc => acc.customerId === customerData.id));
              setTransactions(dummyTransactions.filter(txn => txn.customerId === customerData.id));
            } else {
              toast.error('No matching customer found in dummy data');
            }
          }
          setIsLoading(false);
          return;
        }

        try {
          if (isAdmin) {
            // Admin sees all data
            const [allCustomers, allAccounts, allTransactions] = await Promise.all([
              getCustomers(),
              getAllAccounts(),
              getAllTransactions()
            ]);
            setCustomers(allCustomers || []);
            setAccounts(allAccounts || []);
            setTransactions(allTransactions || []);
          } else {
            // Customer sees only their data
            const [customerData, accountsData, transactionsData] = await Promise.all([
              getCustomerByUserId(userId),
              getAccountsByCustomer(userId),
              getCustomerTransactions(userId)
            ]);

            if (customerData) {
              setCustomers([customerData]);
              setAccounts(accountsData || []);
              setTransactions(transactionsData || []);
            } else {
              toast.error('Customer profile not found');
            }
          }
        } catch (apiError) {
          console.warn('API failed, using dummy data:', apiError);
          if (isAdmin) {
            setCustomers(dummyCustomers);
            setAccounts(dummyAccounts);
            setTransactions(dummyTransactions);
          } else {
            // Fallback to finding customer by email in dummy data
            const customerData = dummyCustomers.find(c => c.email === userEmail);
            if (customerData) {
              setCustomers([customerData]);
              setAccounts(dummyAccounts.filter(acc => acc.customerId === customerData.id));
              setTransactions(dummyTransactions.filter(txn => txn.customerId === customerData.id));
              toast.error('Using dummy data as fallback');
            } else {
              toast.error('Failed to load your profile');
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session, userId, isAdmin, userEmail]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const recentCustomers = customers.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);
  const currentCustomer = customers[0]?.fullName || 'Customer';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">
        {isAdmin ? 'Admin Dashboard' : `Welcome, ${currentCustomer}`}
      </h1>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: isAdmin ? 'Customers' : 'My Profile',
            value: customers.length,
            icon: <FiUsers className="text-2xl text-blue-600" />,
            valueColor: 'text-blue-600',
            bgColor: 'bg-gray-100',
            iconBgColor: 'bg-blue-100',
            borderColor: 'border-blue-200',
            action: () => router.push(isAdmin ? '/dashboard/customers' : '/dashboard/profile')
          },
          {
            title: isAdmin ? 'Accounts' : 'My Accounts',
            value: accounts.length,
            icon: <FiCreditCard className="text-2xl text-green-600" />,
            valueColor: 'text-green-600',
            bgColor: 'bg-gray-100',
            iconBgColor: 'bg-green-100',
            borderColor: 'border-green-200',
            action: () => router.push('/dashboard/accounts')
          },
          {
            title: isAdmin ? 'Transactions' : 'My Transactions',
            value: transactions.length,
            icon: <FiDollarSign className="text-2xl text-purple-600" />,
            valueColor: 'text-purple-600',
            subtitle: isAdmin ? '' : `Balance: $${totalBalance.toFixed(2)}`,
            bgColor: 'bg-gray-100',
            iconBgColor: 'bg-purple-100',
            borderColor: 'border-purple-200',
            action: () => router.push('/dashboard/transactions')
          }
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`border ${stat.borderColor} p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer hover:translate-y-[-2px] ${stat.bgColor}`}
            onClick={stat.action}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.valueColor}`}>
                  {stat.value.toLocaleString()}
                </p>
                {stat.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.iconBgColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers (only shown for admin) */}
        {isAdmin && (
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
              {recentCustomers.map(customer => (
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
        )}

        {/* Recent Transactions */}
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black">
              {isAdmin ? 'Recent Transactions' : 'My Recent Transactions'}
            </h2>
            {isAdmin && (
              <button 
                onClick={() => router.push('/dashboard/transactions/new')}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                <FiPlus size={14} />
                <span>Add Transaction</span>
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center hover:bg-gray-50 p-2 rounded cursor-pointer"
                  onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)}
                >
                  <div>
                    <p className="font-medium text-black">{transaction.type}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.description && ` • ${transaction.description}`}
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
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No transactions found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}