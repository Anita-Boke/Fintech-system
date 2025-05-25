'use client';

import { getTransactions, deleteTransaction } from '@/lib/services/transactionService';
import { getAccounts } from '@/lib/services/accountService';
import TransactionCard from './TransactionCard';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function TransactionList() {
  const [transactions, setTransactions] = useState(getTransactions());
  const [accounts, setAccounts] = useState(getAccounts());

  const handleDelete = (id: string) => {
    const updatedTransactions = deleteTransaction(id);
    setTransactions(updatedTransactions);
    toast.success('Transaction deleted successfully');
  };

  useEffect(() => {
    setTransactions(getTransactions());
    setAccounts(getAccounts());
  }, []);

  const getAccountNumber = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.accountNumber : 'Unknown Account';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">All Transactions</h2>
        <Link 
          href="/dashboard/transactions/new"
          className="bg-primary text-black px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Add New Transaction
        </Link>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions found</p>
          <Link 
            href="/dashboard/transactions/new"
            className="text-primary hover:underline mt-2 inline-block"
          >
            Create your first transaction
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.map(transaction => (
            <TransactionCard 
              key={transaction.id} 
              transaction={{
                ...transaction,
                accountNumber: getAccountNumber(transaction.accountId)
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}