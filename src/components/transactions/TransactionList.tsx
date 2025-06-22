'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAllTransactions, getCustomerTransactions } from '@/lib/services/transactionService';
import { toast } from 'react-toastify';
import { dummyTransactions, dummyCustomers, dummyAccounts, Transaction } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import Link from 'next/link';

interface EnhancedTransaction extends Transaction {
  accountNumber: string;
  customerName: string;
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [transactions, setTransactions] = useState<EnhancedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        
        const isAdmin = session.user.role === 'admin';

        if (process.env.NODE_ENV === 'development') {
          // Development with dummy data
          let filteredTransactions = dummyTransactions;
          
          if (!isAdmin) {
            // Find customer by email in dummy data
            const customer = dummyCustomers.find(c => c.email === session.user?.email);
            if (customer) {
              // Find all accounts belonging to this customer
              const customerAccountIds = dummyAccounts
                .filter(acc => acc.customerId === customer.id)
                .map(acc => acc.id);
              
              // Filter transactions for these accounts
              filteredTransactions = dummyTransactions.filter(
                t => customerAccountIds.includes(t.accountId) || 
                     (t.toAccountId && customerAccountIds.includes(t.toAccountId))
              );
            }
          }

          // Enhance transactions with account numbers and customer names
          const enhanced = filteredTransactions.map(t => {
            const account = dummyAccounts.find(a => a.id === t.accountId);
            const customer = dummyCustomers.find(c => c.id === t.customerId);
            return {
              ...t,
              accountNumber: account?.accountNumber || 'N/A',
              customerName: customer?.fullName || 'Unknown'
            };
          });

          setTransactions(enhanced);
          setLoading(false);
          return;
        }

        // Production with API calls
        let transactionsData: Transaction[];
        if (isAdmin) {
          transactionsData = await getAllTransactions();
        } else {
          transactionsData = await getCustomerTransactions(session.user.id);
        }

        // In a real app, you would enhance these with account numbers from your API
        const enhanced = transactionsData.map(t => ({
          ...t,
          accountNumber: 'N/A', // Replace with actual account number from API
          customerName: 'Unknown' // Replace with actual customer name from API
        }));

        setTransactions(enhanced);
      } catch (error) {
        console.error('Error loading transactions:', error);
        toast.error('Failed to load transactions');
        // Fallback to dummy data in case of error
        let filteredTransactions = dummyTransactions;
        if (session.user.role !== 'admin') {
          const customer = dummyCustomers.find(c => c.email === session.user?.email);
          if (customer) {
            const customerAccountIds = dummyAccounts
              .filter(acc => acc.customerId === customer.id)
              .map(acc => acc.id);
            filteredTransactions = dummyTransactions.filter(
              t => customerAccountIds.includes(t.accountId) || 
                   (t.toAccountId && customerAccountIds.includes(t.toAccountId))
            );
          }
        }
        setTransactions(filteredTransactions.map(t => ({
          ...t,
          accountNumber: dummyAccounts.find(a => a.id === t.accountId)?.accountNumber || 'N/A',
          customerName: dummyCustomers.find(c => c.id === t.customerId)?.fullName || 'Unknown'
        })));
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">
          {session?.user?.role === 'admin' ? 'All Transactions' : 'My Transactions'}
        </h1>
        {session?.user?.role === 'admin' && (
          <Link
            href="/dashboard/transactions/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FiPlus /> New Transaction
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {session?.user?.role === 'admin' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  {session?.user?.role === 'admin' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.accountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.customerName}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'Deposit' || transaction.type === 'Loan Payment' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'Deposit' || transaction.type === 'Loan Payment' ? '+' : '-'}
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}