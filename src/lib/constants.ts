// src/lib/constants.ts

/* =================
   CORE INTERFACES
   ================= */

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
  userId?:string;
}
export interface AccountWithCustomer extends Account {
  customerName: string;
}
export interface Transaction {
  id: string;
  userId?:string;
  accountId: string;
  toAccountId?: string; 
  customerId:string; 
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Loan Payment';
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  description?: string;
 //userId?: string; // Added for user association
}
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  customerId?: string; // For customer users
  name?: string; // Optional name field
}
/* =================
   STORAGE CONSTANTS
   ================= */

export const STORAGE_KEYS = {
  CUSTOMERS: 'fintech-customers-v1',
  ACCOUNTS: 'fintech-accounts-v1',
  TRANSACTIONS: 'fintech-transactions-v1',
  CONFIG: 'fintech-config-v1',
  USERS: 'fintech-users-v1' // Added for user management
} as const;

/* =================
   DUMMY DATA
   ================= */
 
   export const dummyUsers: User[] = [
  {
    id: 'user_001',
    email: 'admin@bank.com',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 'user_002',
    email: 'wintahboke@gmail.com',
    role: 'customer',
    customerId: 'cus_001',
    name: 'Anita Boke'
  },
  // Add more dummy users as needed
];
export const dummyCustomers: Customer[] = [
  
  {
    id: 'cus_001',
    fullName: 'Anita Boke',
    email: 'wintahboke@gmail.com',
    phone: '0110569188',
    dateOfRegistration: '2024-01-15',
    customerType: 'Individual',
    profilePicture: ''
  },
  {
    id: 'cus_002',
    fullName: 'Bethwel Opilo',
    email: 'bethwel@gmail.com',
    phone: '0712985678',
    dateOfRegistration: '2023-02-20',
    customerType: 'Business',
    profilePicture: ''
  },
  {
    id: 'cus_003',
    fullName: 'Vil Opilo',
    email: 'vil@gmail.com',
    phone: '0712345678',
    dateOfRegistration: '2023-03-15',
    customerType: 'Business',
    profilePicture: ''
  }
];

export const dummyAccounts: Account[] = [
  {
    id: 'acc_001',
    customerId: 'cus_001',
    accountNumber: 'SAV0010001',
    accountType: 'Savings',
    balance: 5000.00,
    status: 'Active'
  },
  {
    id: 'acc_002',
    customerId: 'cus_002',
    accountNumber: 'BUS0020001',
    accountType: 'Business',
    balance: 25000.00,
    status: 'Active'
  },
  {
    id: 'acc_003',
    customerId: 'cus_001',
    accountNumber: 'CHK0010002',
    accountType: 'Checking',
    balance: 1200.00,
    status: 'Active'
  },
  {
    id: 'acc_004',
    customerId: 'cus_003',
    accountNumber: 'BUS0030001',
    accountType: 'Business',
    balance: 18000.00,
    status: 'Active'
  }
];

export const dummyTransactions: Transaction[] = [
  {
    id: 'txn_001',
    accountId: 'acc_001',
    customerId: 'cus_001',
    type: 'Deposit',
    amount: 1000.00,
    date: '2024-03-01T10:30:00Z',
    status: 'Approved',
    description: 'Initial deposit'
  },
  {
    id: 'txn_002',
    accountId: 'acc_001',
    customerId: 'cus_001', 
    type: 'Withdrawal',
    amount: 500.00,
    date: '2024-03-02T14:15:00Z',
    status: 'Approved',
    description: 'ATM withdrawal'
  },
  {
    id: 'txn_003',
    accountId: 'acc_002',
    customerId: 'cus_002',
    type: 'Deposit',
    amount: 5000.00,
    date: '2024-03-02T14:45:00Z',
    status: 'Approved',
    description: 'Business capital'
  },
  {
    id: 'txn_004',
    accountId: 'acc_001',
    toAccountId: 'acc_003',
    customerId: 'cus_002',
    type: 'Transfer',
    amount: 500.00,
    date: '2024-03-03T09:15:00Z',
    status: 'Pending',
    description: 'Transfer to checking'
  },
  {
    id: 'txn_005',
    accountId: 'acc_004',
    customerId: 'cus_003',
    type: 'Loan Payment',
    amount: 1200.00,
    date: '2024-03-04T11:20:00Z',
    status: 'Approved',
    description: 'Monthly loan payment'
  }
];

/* =================
   SYSTEM CONSTANTS
   ================= */

export const BANK_CONFIG = {
  MIN_SAVINGS_BALANCE: 500,
  MIN_CHECKING_BALANCE: 1000,
  BUSINESS_ACCOUNT_FEE: 10,
  TRANSFER_LIMIT: 10000,
  DAILY_WITHDRAWAL_LIMIT: 2000,
  LOAN_INTEREST_RATE: 0.08 // 8%
};

/* =================
   HELPER TYPES
   ================= */

export type AccountType = Account['accountType'];
export type TransactionType = Transaction['type'];
export type TransactionStatus = Transaction['status'];
export type CustomerType = Customer['customerType'];
export type AccountStatus = Account['status'];

/* =================
   UTILITY FUNCTIONS
   ================= */

export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
};

export const generateAccountNumber = (type: AccountType): string => {
  const prefix = {
    Savings: 'SAV',
    Checking: 'CHK',
    Business: 'BUS'
  }[type];
  
  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}${randomPart.substring(0, 3)}${randomPart.substring(3)}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateAccountBalance = (accountId: string, transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.accountId === accountId && t.status === 'Approved')
    .reduce((balance, transaction) => {
      switch (transaction.type) {
        case 'Deposit':
        case 'Loan Payment':
          return balance + transaction.amount;
        case 'Withdrawal':
          return balance - transaction.amount;
        case 'Transfer':
          return transaction.toAccountId 
            ? balance - transaction.amount 
            : balance + transaction.amount;
        default:
          return balance;
      }
    }, 0);
};

// Type predicate for Customer
export const isCustomer = (data: unknown): data is Customer => {
  if (typeof data !== 'object' || data === null) return false;
  
  const candidate = data as Customer;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.fullName === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.phone === 'string' &&
    typeof candidate.dateOfRegistration === 'string' &&
    (candidate.customerType === 'Individual' || candidate.customerType === 'Business') &&
    typeof candidate.profilePicture === 'string'
  );
};

// Type predicate for Account
export const isAccount = (data: unknown): data is Account => {
  if (typeof data !== 'object' || data === null) return false;
  
  const candidate = data as Account;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.customerId === 'string' &&
    typeof candidate.accountNumber === 'string' &&
    (candidate.accountType === 'Savings' || candidate.accountType === 'Checking' || candidate.accountType === 'Business') &&
    typeof candidate.balance === 'number' &&
    (candidate.status === 'Active' || candidate.status === 'Suspended' || candidate.status === 'Closed')
  );
};

// Type predicate for Transaction
export const isTransaction = (data: unknown): data is Transaction => {
  if (typeof data !== 'object' || data === null) return false;
  
  const candidate = data as Transaction;
  const isValidType = (
    candidate.type === 'Deposit' ||
    candidate.type === 'Withdrawal' ||
    candidate.type === 'Transfer' ||
    candidate.type === 'Loan Payment'
  );
  
  const isValidStatus = (
    candidate.status === 'Pending' ||
    candidate.status === 'Approved' ||
    candidate.status === 'Rejected'
  );
  
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.accountId === 'string' &&
    (typeof candidate.toAccountId === 'string' || candidate.toAccountId === undefined) &&
    isValidType &&
    typeof candidate.amount === 'number' &&
    typeof candidate.date === 'string' &&
    isValidStatus &&
    (typeof candidate.description === 'string' || candidate.description === undefined) &&
    (typeof candidate.userId === 'string' || candidate.userId === undefined)
  );
};