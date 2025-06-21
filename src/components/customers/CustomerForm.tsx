/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createCustomer, updateCustomer, getCustomerByUserId } from '@/lib/services/customerService';
import Link from 'next/link';

type CustomerType = 'Individual' | 'Business';

interface CustomerFormProps {
  customerId?: string;
  mode?: 'view' | 'edit' | 'create';
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  profilePicture: string;
}

export default function CustomerForm({ customerId, mode = 'edit' }: CustomerFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    customerType: 'Individual',
    profilePicture: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  useEffect(() => {
    if (customerId && !isCreateMode) {
      const fetchCustomer = async () => {
        try {
          setIsLoading(true);
          const customer = getCustomerByUserId(customerId);
          if (customer) setFormData(customer);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error('Failed to load customer data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [customerId, isCreateMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isViewMode) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'customerType' ? value as CustomerType : value 
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewMode) return;
    
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Valid email is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode || !validateForm()) return;

    setIsLoading(true);
    try {
      if (customerId) {
        updateCustomer(customerId, formData);
        toast.success('Customer updated successfully');
      } else {
        createCustomer(formData);
        toast.success('Customer created successfully');
      }
      router.push('/dashboard/customers');
    } catch (error) {
      toast.error('Failed to save customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {isViewMode ? 'Customer Details' : customerId ? 'Edit Customer' : 'Create New Customer'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
              isViewMode 
                ? 'bg-gray-100 border-gray-200 text-gray-700' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            }`}
            required={!isViewMode}
            readOnly={isViewMode}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
              isViewMode 
                ? 'bg-gray-100 border-gray-200 text-gray-700' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            }`}
            required={!isViewMode}
            readOnly={isViewMode}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
              isViewMode 
                ? 'bg-gray-100 border-gray-200 text-gray-700' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            }`}
            required={!isViewMode}
            readOnly={isViewMode}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black mb-1">Customer Type</label>
          {isViewMode ? (
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700">
              {formData.customerType}
            </div>
          ) : (
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isViewMode}
            >
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
            </select>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
          {isViewMode ? (
            formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile" 
                className="h-24 w-24 object-cover rounded border"
              />
            ) : (
              <div className="text-gray-500">No profile picture</div>
            )
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.profilePicture && (
                <div className="mt-2">
                  <img 
                    src={formData.profilePicture} 
                    alt="Preview" 
                    className="h-24 w-24 object-cover rounded border"
                  />
                </div>
              )}
            </>
          )}
        </div>
        
        {!isViewMode && (
          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href="/dashboard/customers"
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : customerId ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}