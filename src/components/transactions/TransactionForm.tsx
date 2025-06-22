// src/components/transactions/TransactionForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { saveTransaction, updateTransaction, getTransactionById } from '@/lib/services/transactionService';
import { getAccounts } from '@/lib/services/accountService';
import Link from 'next/link';
import { dummyCustomers, dummyAccounts, type Account, type Transaction } from '@/lib/constants';

interface TransactionFormProps {
  transactionId?: string;
}

interface FormData {
  accountId: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  toAccountId: string;
  description: string;
}

export default function TransactionForm({ transactionId }: TransactionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
        setIsLoading(true);
        const loadedAccounts = await getAccounts();
        setAllAccounts(loadedAccounts);
        
        // Filter accounts based on user role
        if (!isAdmin) {
          const customer = dummyCustomers.find(c => c.email === session?.user?.email);
          const customerAccts = loadedAccounts.filter(acc => acc.customerId === customer?.id);
          setCustomerAccounts(customerAccts);
        } else {
          setCustomerAccounts(loadedAccounts);
        }
        
        if (transactionId) {
          const transaction = await getTransactionById(transactionId);
          if (transaction) {
            setFormData({
              accountId: transaction.accountId,
              type: transaction.type,
              amount: transaction.amount,
              status: transaction.status,
              toAccountId: transaction.toAccountId || '',
              description: transaction.description || ''
            });
          }
        }
      } catch (error) {
        toast.error('Failed to load transaction data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [transactionId, session?.user?.email, isAdmin]);

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
      const transactionData: Transaction = {
        ...formData,
        id: transactionId || `txn_${Date.now()}`,
        status: isAdmin ? formData.status : 'Pending',
        userId: session?.user?.id || '',
        customerId: dummyCustomers.find(c => c.email === session?.user?.email)?.id || '',
        date: new Date().toISOString()
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

  const getDisplayAccounts = () => {
    return isAdmin ? allAccounts : customerAccounts;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
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
            required
            value={formData.accountId}
            onChange={(e) => setFormData({...formData, accountId: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={!!transactionId}
          >
            <option value="">Select Account</option>
            {getDisplayAccounts().map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountNumber} - {account.accountType} (${account.balance?.toFixed(2)})
                {isAdmin && ` - ${dummyCustomers.find(c => c.id === account.customerId)?.fullName}`}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ 
              ...formData, 
              type: e.target.value as 'Deposit' | 'Withdrawal' | 'Transfer',
              toAccountId: '' // Reset when type changes
            })}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={!!transactionId}
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
              disabled={!!transactionId}
            >
              <option value="">Select Destination Account</option>
              {allAccounts
                .filter(account => account.id !== formData.accountId)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} (${account.balance?.toFixed(2)})
                    {isAdmin && ` - ${dummyCustomers.find(c => c.id === account.customerId)?.fullName}`}
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
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full p-2 border border-gray-300 rounded"
            required
            min="0.01"
            step="0.01"
            disabled={!!transactionId && !isAdmin}
          />
        </div>

        {/* Status (admin only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ 
                ...formData, 
                status: e.target.value as 'Pending' | 'Approved' | 'Rejected' 
              })}
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
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            href={isAdmin ? '/dashboard/transactions' : '/dashboard/customer'}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : transactionId ? 'Update Transaction' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}