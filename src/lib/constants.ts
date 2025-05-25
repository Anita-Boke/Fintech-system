// Interfaces
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfRegistration: string;
  customerType: 'Individual' | 'Business';
  profilePicture: string;
}

export interface Account {
  id: string;
  customerId: string;
  accountNumber: string;
  accountType: 'Savings' | 'Checking' | 'Business';
  balance: number;
  status: 'Active' | 'Suspended' | 'Closed';
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Loan Payment';
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Dummy Data
export const dummyCustomers: Customer[] = [
  {
    id: '1',
    fullName: 'Anita Boke',
    email: 'wintahboke@gmail.com',
    phone: '00110569188',
    dateOfRegistration: '2024-01-15',
    customerType: 'Individual',
    profilePicture: ''
  },
  {
    id: '2',
    fullName: 'Bethwel',
    email: 'bethwel@gmail.com',
    phone: '0712985678',
    dateOfRegistration: '2023-02-20',
    customerType: 'Business',
    profilePicture: ''
  }
];

export const dummyAccounts: Account[] = [
  {
    id: '1',
    customerId: '1',
    accountNumber: 'ACC10001',
    accountType: 'Savings',
    balance: 5000,
    status: 'Active'
  },
  {
    id: '2',
    customerId: '2',
    accountNumber: 'ACC10002',
    accountType: 'Business',
    balance: 25000,
    status: 'Active'
  }
];

export const dummyTransactions: Transaction[] = [
  {
    id: '1',
    accountId: '1',
    type: 'Deposit',
    amount: 1000,
    date: '2023-05-01',
    status: 'Approved'
  },
  {
    id: '2',
    accountId: '2',
    type: 'Deposit',
    amount: 5000,
    date: '2023-05-02',
    status: 'Approved'
  }
];

// Session Storage Utilities
const STORAGE_KEYS = {
  CUSTOMERS: 'banking_app_customers',
  ACCOUNTS: 'banking_app_accounts',
  TRANSACTIONS: 'banking_app_transactions'
};

export const initializeSessionStorage = () => {
  if (!sessionStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    saveAllDataToSessionStorage();
  }
};

export const saveAllDataToSessionStorage = (
  customers: Customer[] = dummyCustomers,
  accounts: Account[] = dummyAccounts,
  transactions: Transaction[] = dummyTransactions
) => {
  sessionStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  sessionStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  sessionStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const loadFromSessionStorage = () => {
  return {
    customers: loadCustomersFromSessionStorage(),
    accounts: loadAccountsFromSessionStorage(),
    transactions: loadTransactionsFromSessionStorage()
  };
};

export const loadCustomersFromSessionStorage = (): Customer[] => {
  const data = sessionStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return data ? JSON.parse(data) : dummyCustomers;
};

export const loadAccountsFromSessionStorage = (): Account[] => {
  const data = sessionStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  return data ? JSON.parse(data) : dummyAccounts;
};

export const loadTransactionsFromSessionStorage = (): Transaction[] => {
  const data = sessionStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : dummyTransactions;
};

export const saveCustomersToSessionStorage = (customers: Customer[]) => {
  sessionStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const saveAccountsToSessionStorage = (accounts: Account[]) => {
  sessionStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const saveTransactionsToSessionStorage = (transactions: Transaction[]) => {
  sessionStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const clearSessionStorage = () => {
  sessionStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  sessionStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  sessionStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
};

// Helper Functions
export const findCustomerById = (id: string): Customer | undefined => {
  const customers = loadCustomersFromSessionStorage();
  return customers.find(customer => customer.id === id);
};

export const findAccountsByCustomerId = (customerId: string): Account[] => {
  const accounts = loadAccountsFromSessionStorage();
  return accounts.filter(account => account.customerId === customerId);
};

export const findTransactionsByAccountId = (accountId: string): Transaction[] => {
  const transactions = loadTransactionsFromSessionStorage();
  return transactions.filter(transaction => transaction.accountId === accountId);
};