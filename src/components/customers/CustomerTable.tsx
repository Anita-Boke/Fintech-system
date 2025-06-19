// src/components/customers/CustomerTable.tsx
'use client';

import { Customer } from '@/lib/constants';

interface CustomerTableProps {
  customers: Customer[];
}

export default function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.fullName}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>
                <span className={`badge ${
                  customer.customerType === 'Business' 
                    ? 'badge-primary' 
                    : 'badge-secondary'
                }`}>
                  {customer.customerType}
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