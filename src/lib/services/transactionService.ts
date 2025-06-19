// src/lib/services/transactionService.ts
import { Transaction, STORAGE_KEYS } from '../constants';
import { updateAccount, getAccount, getAccountsByCustomer } from './accountService';

// Helper function to persist transactions
const persistTransactions = (transactions: Transaction[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }
};

export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return stored ? JSON.parse(stored) : [];
};

export const getTransactionById = (id: string): Transaction | undefined => {
  return getTransactions().find(t => t.id === id);
};

export const saveTransaction = async (
  transactionData: Omit<Transaction, 'id' | 'date'>,
  user?: { id: string; role: 'admin' | 'customer' }
): Promise<Transaction> => {
  // Validate customer permissions
  if (user?.role === 'customer') {
    // Customers can only create transactions for their own accounts
    const account = await getAccount(transactionData.accountId);
    if (!account || account.userId !== user.id) {
      throw new Error('Unauthorized: You can only create transactions for your own accounts');
    }
    
    // Customers can't set status directly
    if (transactionData.status && transactionData.status !== 'Pending') {
      throw new Error('Unauthorized: Only admins can set transaction status');
    }
  }

  // Verify accounts exist for transfers
  if (transactionData.type === 'Transfer' && !transactionData.toAccountId) {
    throw new Error('Transfer transactions require a toAccountId');
  }

  if (transactionData.type === 'Transfer') {
    const toAccount = await getAccount(transactionData.toAccountId!);
    if (!toAccount) {
      throw new Error('Destination account not found');
    }
  }

  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transactionData,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    status: transactionData.status || 'Pending'
  };
  
  const updatedTransactions = [...transactions, newTransaction];
  persistTransactions(updatedTransactions);
  
  if (newTransaction.status === 'Approved') {
    await updateAccountBalance(newTransaction);
  }
  
  return newTransaction;
};

export const updateTransaction = async (
  id: string, 
  updates: Partial<Transaction>,
  user?: { id: string; role: 'admin' | 'customer' }
): Promise<Transaction> => {
  // Only admins can update transactions
  if (user?.role !== 'admin'&& updates.userId !== user?.id) {
    throw new Error('Unauthorized: Only admins can update transactions');
  }

  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Transaction not found');
  
  const updatedTransaction = { ...transactions[index], ...updates };
  const updatedTransactions = [...transactions];
  updatedTransactions[index] = updatedTransaction;
  
  persistTransactions(updatedTransactions);
  
  if (updates.status === 'Approved') {
    await updateAccountBalance(updatedTransaction);
  }
  
  return updatedTransaction;
};

const updateAccountBalance = async (transaction: Transaction) => {
  try {
    switch (transaction.type) {
      case 'Deposit':
        await updateAccount(transaction.accountId, { balance: transaction.amount });
        break;
      case 'Withdrawal':
        await updateAccount(transaction.accountId, { balance: -transaction.amount });
        break;
      case 'Transfer':
        if (transaction.toAccountId) {
          await updateAccount(transaction.accountId, { balance: -transaction.amount });
          await updateAccount(transaction.toAccountId, { balance: transaction.amount });
        }
        break;
    }
  } catch (error) {
    console.error('Failed to update account balance:', error);
    throw new Error('Failed to complete transaction: account update failed');
  }
};

export const approveTransaction = async (
  id: string, 
  user?: { id: string; role: string }
): Promise<Transaction> => {
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can approve transactions');
  }
  return await updateTransaction(
    id, 
    { status: 'Approved' }, 
    user as { id: string; role: 'admin' | 'customer' }  // Type assertion
  );
};
export const rejectTransaction = async (
  id: string, 
  user?: { id: string; role: 'admin' | 'customer' }  // Updated type here
): Promise<Transaction> => {
  if (user?.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can reject transactions');
  }
  return await updateTransaction(id, { status: 'Rejected' }, user);
};
// Add this to your existing transactionService.ts
export const getAllTransactions = (): Transaction[] => {
  return getTransactions();
};

// Update your getCustomerTransactions to use account relationships
export const getCustomerTransactions = (customerId: string): Transaction[] => {
  const accounts = getAccountsByCustomer(customerId); // This comes from accountService
  const accountIds = accounts.map(account => account.id);
  return getTransactions().filter(t => accountIds.includes(t.accountId));
};

export const getAccountTransactions = (accountId: string, userId?: string): Transaction[] => {
  const transactions = getTransactions().filter(t => t.accountId === accountId);
  
  // If userId is provided, filter to ensure customers only see their own transactions
  if (userId) {
    return transactions.filter(t => t.userId === userId);
  }
  
  return transactions;
};

export const getPendingTransactions = (userId?: string): Transaction[] => {
  const transactions = getTransactions().filter(t => t.status === 'Pending');
  
  // Filter for customer-specific view
  if (userId) {
    return transactions.filter(t => t.userId === userId);
  }
  
  return transactions;
};