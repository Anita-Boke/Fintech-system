import { Account, dummyAccounts } from '../constants';

const ACCOUNTS_KEY = 'fintech-accounts';

export const getAccounts = (): Account[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(dummyAccounts));
    return dummyAccounts;
  }
};

export const saveAccount = (account: Omit<Account, 'id' | 'accountNumber'>): Account => {
  const accounts = getAccounts();
  const newAccount = {
    ...account,
    id: Date.now().toString(),
    accountNumber: `ACC${Math.floor(10000 + Math.random() * 90000)}`
  };
  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return newAccount;
};

export const updateAccount = (id: string, updatedData: Partial<Account>): Account | null => {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === id);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...updatedData };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return accounts[index];
  }
  return null;
};

export const deleteAccount = (id: string): Account[] => {
  const accounts = getAccounts();
  const filtered = accounts.filter(a => a.id !== id);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));
  return filtered;
};

export const getAccountById = (id: string): Account | undefined => {
  const accounts = getAccounts();
  return accounts.find(a => a.id === id);
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