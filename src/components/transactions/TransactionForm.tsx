// src/components/transactions/TransactionForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { saveTransaction, updateTransaction, getTransactionById } from '@/lib/services/transactionService';
import { getAccounts } from '@/lib/services/accountService';
import Link from 'next/link';

export default function TransactionForm({ transactionId }: { transactionId?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'Deposit',
    amount: 0,
    status: 'Pending',
    toAccountId: '',
    description: ''
  });

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedAccounts = await getAccounts();
        setAccounts(loadedAccounts);
        
        if (transactionId) {
          const transaction = await getTransactionById(transactionId);
          if (transaction) setFormData(transaction);
        }
      } catch (error) {
        toast.error('Failed to load transaction data');
        console.error(error);
      }
    };
    
    loadData();
  }, [transactionId]);

  const validateForm = (): boolean => {
    if (!formData.accountId) {
      toast.error('Please select an account');
      return false;
    }
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return false;
    }
    if (formData.type === 'Transfer' && !formData.toAccountId) {
      toast.error('Please select a destination account for transfer');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const status = isAdmin ? formData.status : 'Pending';
      const transactionData = {
        ...formData,
        status,
        userId: session?.user?.id
      };

      if (transactionId) {
        await updateTransaction(transactionId, transactionData);
        toast.success('Transaction updated successfully');
      } else {
        await saveTransaction(transactionData);
        toast.success('Transaction created successfully');
      }

      router.push(isAdmin ? '/dashboard/transactions' : '/dashboard/customer');
      router.refresh();
    } catch (error) {
      toast.error('Error saving transaction');
      console.error('Submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {transactionId ? 'Edit Transaction' : 'Create New Transaction'}
      </h1>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-medium">Processing transaction...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
          <select
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            required
            disabled={!!transactionId}
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.accountNumber} (${account.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>

        {/* Destination Account for Transfer */}
        {formData.type === 'Transfer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
            <select
              value={formData.toAccountId}
              onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Destination Account</option>
              {accounts
                .filter(account => account.id !== formData.accountId)
                .map(account => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} (${account.balance.toFixed(2)})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded"
            required
            min="1"
            step="0.01"
          />
        </div>

        {/* Status (admin only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Optional description"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {transactionId ? 'Update Transaction' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
