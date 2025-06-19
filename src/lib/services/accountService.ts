// src/lib/services/accountService.ts
import { Account, dummyAccounts } from '../constants';

const ACCOUNTS_KEY = 'fintech-accounts';

export const getAccounts = (): Account[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = sessionStorage.getItem(ACCOUNTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    sessionStorage.setItem(ACCOUNTS_KEY, JSON.stringify(dummyAccounts));
    return dummyAccounts;
  }
};
export const getAccount = (accountId: string): Account | undefined => {
  const accounts = getAccounts();
  return accounts.find(account => account.id === accountId);
};

export const saveAccount = (account: Omit<Account, 'id' | 'accountNumber'>): Account => {
  const accounts = getAccounts();
  const newAccount = {
    ...account,
    id: Date.now().toString(),
    accountNumber: `ACC${Math.floor(10000 + Math.random() * 90000)}`
  };
  accounts.push(newAccount);
  sessionStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return newAccount;
};

export const updateAccount = (id: string, updatedData: Partial<Account>): Account | null => {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === id);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...updatedData };
    sessionStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return accounts[index];
  }
  return null;
};

export const deleteAccount = (id: string): Account[] => {
  const accounts = getAccounts();
  const filtered = accounts.filter(a => a.id !== id);
  sessionStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));
  return filtered;
};

export const getAccountById = (id: string): Account | undefined => {
  const accounts = getAccounts();
  return accounts.find(a => a.id === id);
};
// src/lib/services/accountService.ts

export const getAllAccounts = (): Account[] => {
  return getAccounts();
};

export const getCustomerAccounts = (customerId: string): Account[] => {
  return getAccounts().filter(a => a.customerId === customerId);
};

export const getUserAccounts = (userId: string, isAdmin: boolean): Account[] => {
  return isAdmin 
    ? getAllAccounts()
    : getCustomerAccounts(userId); // Assuming userId = customerId in dummy data
};
export const getAccountsByCustomer = (customerId: string): Account[] => {
  const accounts = getAccounts();
  return accounts.filter(a => a.customerId === customerId);
};

export const updateAccountBalance = (accountId: string, amount: number, type: 'Deposit' | 'Withdrawal'): Account | null => {
  const account = getAccountById(accountId);
  if (!account) return null;

  const newBalance = type === 'Deposit' 
    ? account.balance + amount 
    : account.balance - amount;

  return updateAccount(accountId, { balance: newBalance });
};