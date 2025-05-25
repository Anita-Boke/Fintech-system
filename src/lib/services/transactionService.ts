import { Transaction, dummyTransactions } from '../constants';
import { updateAccountBalance, getAccountById } from './accountService';

const TRANSACTIONS_KEY = 'fintech-transactions';

export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(dummyTransactions));
    return dummyTransactions;
  }
};

export const saveTransaction = (transaction: Omit<Transaction, 'id' | 'date'>): Transaction => {
  const transactions = getTransactions();
  const newTransaction = {
    ...transaction,
    id: Date.now().toString(),
    date: new Date().toISOString()
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  if (newTransaction.status === 'Approved') {
    updateAccountBalance(
      newTransaction.accountId,
      newTransaction.amount,
      newTransaction.type
    );
  }

  return newTransaction;
};

export const updateTransaction = (id: string, updatedData: Partial<Transaction>): Transaction | null => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index === -1) return null;

  const oldTransaction = transactions[index];
  const updatedTransaction = { ...oldTransaction, ...updatedData };
  transactions[index] = updatedTransaction;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  // Handle balance updates if status changes
  if (updatedData.status && updatedData.status !== oldTransaction.status) {
    const account = getAccountById(oldTransaction.accountId);
    if (!account) return updatedTransaction;

    if (updatedData.status === 'Approved') {
      updateAccountBalance(
        oldTransaction.accountId,
        oldTransaction.amount,
        oldTransaction.type
      );
    } else if (oldTransaction.status === 'Approved') {
      // Reverse the previous transaction
      updateAccountBalance(
        oldTransaction.accountId,
        oldTransaction.amount,
        oldTransaction.type === 'Deposit' ? 'Withdrawal' : 'Deposit'
      );
    }
  }

  return updatedTransaction;
};

export const deleteTransaction = (id: string): Transaction[] => {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) return transactions;

  const filtered = transactions.filter(t => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));

  // Reverse balance if transaction was approved
  if (transaction.status === 'Approved') {
    updateAccountBalance(
      transaction.accountId,
      transaction.amount,
      transaction.type === 'Deposit' ? 'Withdrawal' : 'Deposit'
    );
  }

  return filtered;
};

export const getTransactionById = (id: string): Transaction | undefined => {
  const transactions = getTransactions();
  return transactions.find(t => t.id === id);
};

export const getTransactionsByAccount = (accountId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter(t => t.accountId === accountId);
};