// src/lib/services/storageService.ts
import { STORAGE_KEYS, dummyCustomers, dummyAccounts, dummyTransactions } from '../constants';

export const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  // Initialize customers
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(dummyCustomers));
  }
  
  // Initialize accounts
  if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(dummyAccounts));
  }
  
  // Initialize transactions
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(dummyTransactions));
  }
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
};

export const exportAllData = () => {
  return {
    customers: localStorage.getItem(STORAGE_KEYS.CUSTOMERS),
    accounts: localStorage.getItem(STORAGE_KEYS.ACCOUNTS),
    transactions: localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  };
};

export const importAllData = (data: {
  customers: string;
  accounts: string;
  transactions: string;
}) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, data.accounts);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, data.transactions);
};