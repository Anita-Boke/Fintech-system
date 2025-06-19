'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getTransactions, approveTransaction, rejectTransaction } from '@/lib/services/transactionService';
import { getAccounts } from '@/lib/services/accountService';
import TransactionTable from './TransactionTable';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Account {
  id: string;
  accountNumber: string;
  userId: string;
}

interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  date:string;
}

interface EnhancedTransaction extends Transaction {
  accountNumber: string;
  
}


export default function TransactionList() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = session?.user?.role === 'admin';
  const userId = session?.user?.id;

  // Define getAccountNumber once
  const getAccountNumber = (accountId: string): string => {
    const account = accounts.find(a => a.id === accountId);
    return account?.accountNumber ?? 'N/A';
  };

  // Compute enhancedTransactions AFTER accounts are loaded
  const enhancedTransactions: EnhancedTransaction[] = transactions.map(t => ({
    ...t,
    accountNumber: getAccountNumber(t.accountId)
  }));

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!userId) return;
        
        setLoading(true);
        const [loadedAccounts, loadedTransactions] = await Promise.all([
          getAccounts() as unknown as Promise<Account[]>,
          getTransactions() as unknown as Promise<Transaction[]>
        ]);
        
        setAccounts(loadedAccounts);
        
        const filteredTransactions = isAdmin 
          ? loadedTransactions 
          : loadedTransactions.filter(t => {
              const userAccountId = session?.user?.accountId;
              return t.userId === userId || (userAccountId && t.accountId === userAccountId);
            });
        
        setTransactions(filteredTransactions);
      } catch (error) {
        toast.error('Failed to load transactions');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAdmin, userId, session?.user?.accountId]);

  const handleStatusChange = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      setLoading(true);
      
      const user = {
        id: session.user.id,
        role: session.user.role
      };

      if (status === 'Approved') {
        await approveTransaction(id, user);
      } else {
        await rejectTransaction(id, user);
      }
      
      const updatedTransactions = await getTransactions() as Transaction[];
      const filteredTransactions = isAdmin 
        ? updatedTransactions 
        : updatedTransactions.filter(t => {
            const userAccountId = session.user?.accountId;
            return t.userId === userId || (userAccountId && t.accountId === userAccountId);
          });
      
      setTransactions(filteredTransactions);
      toast.success(`Transaction ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} transaction`);
      console.error('Status change error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">Transactions</h2>
        {isAdmin && (
          <Link
            href="/dashboard/transactions/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Transaction
          </Link>
        )}
      </div>
  
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No transactions found</p>
          {isAdmin && (
            <Link
              href="/dashboard/transactions/new"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Create your first transaction
            </Link>
          )}
        </div>
      ) : (
        <TransactionTable 
          transactions={enhancedTransactions}
          onStatusChange={isAdmin ? handleStatusChange : undefined}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}