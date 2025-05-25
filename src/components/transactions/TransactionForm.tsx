'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/constants';
import { saveTransaction, updateTransaction, getTransactionById } from '@/lib/services/transactionService';
import { getAccounts } from '@/lib/services/accountService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface TransactionFormProps {
  transactionId?: string;
}

export default function TransactionForm({ transactionId }: TransactionFormProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(getAccounts());
  const [formData, setFormData] = useState<Partial<Transaction>>({
    accountId: '',
    type: 'Deposit',
    amount: 0,
    status: 'Pending',
    toAccountId: '' // Added for transfer functionality
  });

  useEffect(() => {
    if (transactionId) {
      const transaction = getTransactionById(transactionId);
      if (transaction) setFormData(transaction);
    }
    setAccounts(getAccounts());
  }, [transactionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (transactionId && formData.id) {
        await updateTransaction(transactionId, formData);
        toast.success('Transaction updated successfully');
      } else {
        // For transfers, we might want to create two transactions (debit and credit)
        if (formData.type === 'Transfer' && formData.toAccountId) {
          // Debit from source account
          await saveTransaction({
            accountId: formData.accountId || '',
            type: 'Transfer',
            amount: formData.amount || 0,
            status: formData.status || 'Pending',
            toAccountId: formData.toAccountId,
            description: `Transfer to account ${formData.toAccountId}`
          });
          
          // Credit to destination account
          await saveTransaction({
            accountId: formData.toAccountId,
            type: 'Deposit',
            amount: formData.amount || 0,
            status: formData.status || 'Pending',
            description: `Transfer from account ${formData.accountId}`
          });
        } else {
          await saveTransaction({
            accountId: formData.accountId || '',
            type: formData.type || 'Deposit',
            amount: formData.amount || 0,
            status: formData.status || 'Pending'
          });
        }
        toast.success('Transaction created successfully');
      }
      router.push('/dashboard/transactions');
    } catch (error) {
      toast.error('Error saving transaction');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-black">
        {transactionId ? 'Edit Transaction' : 'Create New Transaction'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
          <select
            value={formData.accountId || ''}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-400"
            required
            disabled={!!transactionId}
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.accountNumber} (Balance: ${account.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <select
            value={formData.type || 'Deposit'}
            onChange={(e) => setFormData({ 
              ...formData, 
              type: e.target.value as 'Deposit' | 'Withdrawal' | 'Transfer' | 'Loan Payment',
              toAccountId: e.target.value === 'Transfer' ? formData.toAccountId : ''
            })}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-400"
            required
          >
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Transfer">Transfer</option>
            <option value="Loan Payment">Loan Payment</option>
          </select>
        </div>

        {formData.type === "Transfer" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Account</label>
            <select
              value={formData.toAccountId || ''}
              onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
              className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-400"
              required={formData.type === 'Transfer'}
            >
              <option value="">Select Destination Account</option>
              {accounts
                .filter(account => account.id !== formData.accountId) // Exclude current account
                .map(account => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} (Balance: ${account.balance.toFixed(2)})
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            value={formData.amount || 0}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-400"
            required
            min="0.01"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status || 'Pending'}
            onChange={(e) => setFormData({ 
              ...formData, 
              status: e.target.value as 'Pending' | 'Approved' | 'Rejected' 
            })}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-400"
            required
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/dashboard/transactions"
            className="px-4 py-2 border rounded text-black hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="bg-primary text-black px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            {transactionId ? 'Update Transaction' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}