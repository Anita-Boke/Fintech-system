'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/lib/constants';
import { saveCustomer, updateCustomer, getCustomerById } from '@/lib/services/customerService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface CustomerFormProps {
  customerId?: string;
}

export default function CustomerForm({ customerId }: CustomerFormProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Partial<Customer>>({
    fullName: '',
    email: '',
    phone: '',
    customerType: 'Individual',
    profilePicture: ''
  });

  useEffect(() => {
    if (customerId) {
      const existingCustomer = getCustomerById(customerId);
      if (existingCustomer) {
        setCustomer(existingCustomer);
      }
    }
  }, [customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (customerId && customer.id) {
        await updateCustomer(customerId, customer);
        toast.success('Customer updated successfully');
      } else {
        await saveCustomer({
          fullName: customer.fullName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          customerType: customer.customerType || 'Individual',
          profilePicture: customer.profilePicture || ''
        });
        toast.success('Customer created successfully');
      }
      router.push('/dashboard/customers');
    } catch (error) {
      toast.error('Error saving customer');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomer({ ...customer, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-gray-700">
        {customerId ? 'Edit Customer' : 'Create New Customer'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={customer.fullName || ''}
            onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
            className="w-full p-2 border  border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={customer.email || ''}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            className="w-full p-2 border  border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={customer.phone || ''}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            className="w-full p-2 border  border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
          <select
            value={customer.customerType || 'Individual'}
            onChange={(e) => setCustomer({ 
              ...customer, 
              customerType: e.target.value as 'Individual' | 'Business' 
            })}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
            required
          >
            <option value="Individual">Individual</option>
            <option value="Business">Business</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-transparent text-gray-400"
          />
          {customer.profilePicture && (
            <div className="mt-2">
              <img 
                src={customer.profilePicture} 
                alt="Preview" 
                className="h-24 w-24 object-cover rounded border  "
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/dashboard/customers"
            className="px-4 py-2 border rounded text-black hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors border"
          >
            {customerId ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}