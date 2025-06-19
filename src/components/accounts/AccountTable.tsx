// src/components/accounts/AccountTable.tsx
'use client';

import { Account } from '@/lib/constants';

interface AccountTableProps {
  accounts: Account[];
}

export default function AccountTable({ accounts }: AccountTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Account Number</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(account => (
            <tr key={account.id}>
              <td>{account.accountNumber}</td>
              <td>{account.accountType}</td>
              <td>${account.balance.toFixed(2)}</td>
              <td>
                <span className={`badge ${
                  account.status === 'Active'
                    ? 'badge-success'
                    : account.status === 'Suspended'
                    ? 'badge-warning'
                    : 'badge-error'
                }`}>
                  {account.status}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-outline mr-2">Edit</button>
                <button className="btn btn-sm btn-error">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}