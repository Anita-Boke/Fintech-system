import { Account, Customer, dummyCustomers, dummyUsers, STORAGE_KEYS, Transaction } from '../constants';
import { getAccounts } from './accountService';
import { getTransactions } from './transactionService';

export const getCustomerAccounts = (customerId: string): Account[] => {
  return getAccounts().filter(account => account.customerId === customerId);
};
const getPersistedCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  
  // Check localStorage first (persistent)
  const persistentData = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  if (persistentData) return JSON.parse(persistentData);
  
  // Fallback to sessionStorage (temporary)
  const sessionData = sessionStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  if (sessionData) return JSON.parse(sessionData);
  
  // Final fallback to dummy data
  return [...dummyCustomers];
};

const persistCustomers = (customers: Customer[], persistent: boolean = true): void => {
  if (typeof window === 'undefined') return;
  
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  
  // Sync to both storages if persistent
  if (persistent) {
    sessionStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }
};

export const getCustomers = (): Customer[] => {
  return getPersistedCustomers();
};

export const getCustomerById = (id: string): Customer | undefined => {
  return getCustomers().find(c => c.id === id);
};

export const createCustomer = (customerData: Omit<Customer, 'id' | 'dateOfRegistration'>, persistent: boolean = true): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customerData,
    id: Date.now().toString(),
    dateOfRegistration: new Date().toISOString()
  };
  
  const updatedCustomers = [...customers, newCustomer];
  persistCustomers(updatedCustomers, persistent);
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>, persistent: boolean = true): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updatedCustomer = { ...customers[index], ...updates };
  const updatedCustomers = [...customers];
  updatedCustomers[index] = updatedCustomer;
  
  persistCustomers(updatedCustomers, persistent);
  return updatedCustomer;
};

export const deleteCustomer = (id: string, persistent: boolean = true): boolean => {
  const customers = getCustomers();
  const updatedCustomers = customers.filter(c => c.id !== id);
  const success = updatedCustomers.length < customers.length;
  
  if (success) {
    persistCustomers(updatedCustomers, persistent);
  }
  return success;
}

export const getAccountById = (id: string): Account | undefined => {
  return getAccounts().find(a => a.id === id);
};
/*export const createCustomer = (customerData: Omit<Customer, 'id' | 'dateOfRegistration'>): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customerData,
    id: Date.now().toString(),
    dateOfRegistration: new Date().toISOString()
  };
  
  const updatedCustomers = [...customers, newCustomer];
  sessionStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
  return newCustomer;
};
export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updatedCustomer = { ...customers[index], ...updates };
  const updatedCustomers = [...customers];
  updatedCustomers[index] = updatedCustomer;
  
   
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
  return updatedCustomer;
};

export const deleteCustomer = (id: string): boolean => {
  const customers = getCustomers();
  const updatedCustomers = customers.filter(c => c.id !== id);
  const success = updatedCustomers.length < customers.length;
  
  if (success) {
    sessionStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
  }
  return success;
};*/


export const getCustomerByUserId = (userId: string): Customer | undefined => {
  const user = dummyUsers.find(u => u.id === userId);
  if (!user) return undefined;
  
  if (user.role === 'admin') {
    // Admin might not have a customer record
    return undefined;
  }
  
  // For customers, find their customer record
  return getCustomers().find(c => c.id === user.customerId);
};
export const getAllCustomers = (): Customer[] => {
  return getCustomers();
};
export const getAccountsByCustomer = (customerId: string): Account[] => {
  return getAccounts().filter(a => a.customerId === customerId);
};

export const getCustomerTransactions = (customerId: string): Transaction[] => {
  const customerAccounts = getAccountsByCustomer(customerId);
  return getTransactions().filter(t => 
    customerAccounts.some(a => a.id === t.accountId)
  );
};

export const searchCustomers = (query: string): Customer[] => {
  const lowerQuery = query.toLowerCase();
  return getCustomers().filter(c => 
    c.fullName.toLowerCase().includes(lowerQuery) || 
    c.email.toLowerCase().includes(lowerQuery)
  );
};