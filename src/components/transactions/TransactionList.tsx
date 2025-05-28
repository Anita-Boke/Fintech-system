'use client';

import { getTransactions, deleteTransaction } from '@/lib/services/transactionService';
import { getAccounts } from '@/lib/services/accountService';
import TransactionTable from './TransactionTable';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function TransactionList() {
  const [transactions, setTransactions] = useState(getTransactions());
  const [accounts, setAccounts] = useState(getAccounts());
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = (id: string) => {
    try {
      const updatedTransactions = deleteTransaction(id);
      setTransactions(updatedTransactions);
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete transaction');
      console.error('Delete error:', error);
    }
  };

  const getAccountNumber = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.accountNumber : 'Unknown Account';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">All Transactions</h2>
        <Link 
          href="/dashboard/transactions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Transaction
        </Link>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No transactions found</p>
          <Link
            href="/dashboard/transactions/new"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create your first transaction
          </Link>
        </div>
      ) : (
        <TransactionTable 
          transactions={transactions.map(t => ({
            ...t,
            accountNumber: getAccountNumber(t.accountId)
          }))} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}