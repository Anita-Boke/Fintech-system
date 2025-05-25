import { Customer, dummyCustomers } from '../constants';

const CUSTOMERS_KEY = 'fintech-customers';
const TRANSACTIONS_KEY = 'fintech-transactions'; // Added
const ACCOUNTS_KEY = 'fintech-accounts'; // Optional: if you want to persist accounts

// Get all customers
export const getCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(CUSTOMERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(dummyCustomers));
    return dummyCustomers;
  }
};

// Save a new customer
export const saveCustomer = (customer: Omit<Customer, 'id' | 'dateOfRegistration'>): Customer => {
  const customers = getCustomers();
  const newCustomer = {
    ...customer,
    id: Date.now().toString(),
    dateOfRegistration: new Date().toISOString()
  };
  customers.push(newCustomer);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  return newCustomer;
};

// Update an existing customer
export const updateCustomer = (id: string, updatedData: Partial<Customer>): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updatedData };
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    return customers[index];
  }
  return null;
};

// Delete a customer
export const deleteCustomer = (id: string): Customer[] => {
  const customers = getCustomers();
  const filtered = customers.filter(c => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
  return filtered;
};

// Get a customer by ID
export const getCustomerById = (id: string): Customer | undefined => {
  const customers = getCustomers();
  return customers.find(c => c.id === id);
};

// ✅ Get all accounts (simulated: 1 account per customer)
export const getAccounts = () => {
  return getCustomers().map(customer => ({
    accountId: `acc-${customer.id}`,
    ownerId: customer.id,
    balance: Math.floor(Math.random() * 10000), // Simulated random balance
  }));
};

// ✅ Get recent transactions (simulated)
export const getTransactions = () => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    // Simulated default transactions
    const dummyTransactions = [
      {
        id: 'txn1',
        type: 'Deposit',
        amount: 1200.5,
        date: new Date().toISOString(),
        status: 'Approved'
      },
      {
        id: 'txn2',
        type: 'Withdrawal',
        amount: 540.75,
        date: new Date().toISOString(),
        status: 'Pending'
      },
      {
        id: 'txn3',
        type: 'Transfer',
        amount: 310.0,
        date: new Date().toISOString(),
        status: 'Failed'
      }
    ];
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(dummyTransactions));
    return dummyTransactions;
  }
};
