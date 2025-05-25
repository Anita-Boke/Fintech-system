'use client';

import { getCustomers, deleteCustomer } from '@/lib/services/customerService';
import CustomerCard from './CustomerCard';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const handleDelete = async (id: string) => {
    try {
      const updatedCustomers = deleteCustomer(id);
      setCustomers(updatedCustomers);
      toast.success('Customer deleted successfully');
    } catch (error) {
      toast.error('Failed to delete customer');
      console.error(error);
    }
  };

  useEffect(() => {
    const loadCustomers = () => {
      try {
        const customerData = getCustomers();
        setCustomers(customerData);
      } catch (error) {
        toast.error('Failed to load customers');
        console.error(error);
      }
    };
    loadCustomers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
        <Link
          href="/dashboard/customers/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Customer
        </Link>
      </div>
      
      {customers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new customer</p>
          <Link
            href="/dashboard/customers/new"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Create Customer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customers.map(customer => (
            <CustomerCard 
              key={customer.id} 
              customer={customer}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}