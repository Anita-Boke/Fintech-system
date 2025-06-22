/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiEdit, FiSave, FiTrash2, FiUpload, FiUser, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

type CustomerType = 'Individual' | 'Business' | 'VIP';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  profilePicture: string; // This will store the compressed base64 image
  dateOfRegistration: string;
}

// Helper function to compress images
const compressImage = async (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
    reader.readAsDataURL(file);
  });
};

// LocalStorage helper functions
const getLocalStorageCustomers = (): Customer[] => {
  if (typeof window !== 'undefined') {
    const storedCustomers = localStorage.getItem('customers');
    return storedCustomers ? JSON.parse(storedCustomers) : [];
  }
  return [];
};

const saveLocalStorageCustomers = (customers: Customer[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('customers', JSON.stringify(customers));
  }
};

export default function CustomerForm({ customerId, mode = 'edit', onSuccess }: CustomerFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'dateOfRegistration'> & { 
    id?: string ; 
  customerId?: string;
  }>({
    fullName: '',
    email: '',
    phone: '',
    customerType: 'Individual',
    profilePicture: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

useEffect(() => {
  if (customerId && !isCreateMode) {
    const fetchCustomer = () => {
      try {
        setIsLoading(true);
        
        // First check localStorage
        const localStorageCustomers = getLocalStorageCustomers();
        const localCustomer = localStorageCustomers.find(c => c.id === customerId);
        
        if (localCustomer) {
          setFormData(localCustomer);
          if (localCustomer.profilePicture) {
            setImagePreview(localCustomer.profilePicture);
          }
          setIsLoading(false);
          return;
        }

        // If not found in localStorage, check dummy data
        const dummyCustomer = dummyCustomers.find(c => c.id === customerId);
        if (dummyCustomer) {
          setFormData(dummyCustomer);
          if (dummyCustomer.profilePicture) {
            setImagePreview(dummyCustomer.profilePicture);
          }
          setIsLoading(false);
          return;
        }

        // If not found in either, show error
        toast.error('Customer not found');
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewMode) return;
    
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        // Compress the image before storing
        const compressedImage = await compressImage(file);
        setFormData(prev => ({ ...prev, profilePicture: compressedImage }));
        setImagePreview(compressedImage);
      } catch (error) {
        toast.error('Failed to process image');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
    const customers = getLocalStorageCustomers();
    let updatedCustomers: Customer[];

    if (customerId) {
      // Update existing customer
      updatedCustomers = customers.map(customer => 
        customer.id === customerId 
          ? { 
              ...customer, 
              ...formData,
              id: customerId,
              dateOfRegistration: customer.dateOfRegistration
            } 
          : customer
      );
      toast.success('Customer updated successfully');
    } else {
      // Create new customer
      const newCustomer: Customer = {
        ...formData,
        id: `cust-${Date.now()}`,
        dateOfRegistration: new Date().toISOString()
      };
      updatedCustomers = [...customers, newCustomer];
      toast.success('Customer created successfully');
    }

    saveLocalStorageCustomers(updatedCustomers);
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/dashboard/customers');
    }
  } catch (error) {
    toast.error('Failed to save customer');
  } finally {
    setIsLoading(false);
  }
};

  const handleDelete = () => {
    if (customerId) {
      if (confirm('Are you sure you want to delete this customer?')) {
        const customers = getLocalStorageCustomers();
        const updatedCustomers = customers.filter(c => c.id !== customerId);
        saveLocalStorageCustomers(updatedCustomers);
        toast.success('Customer deleted successfully');
        router.push('/dashboard/customers');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isViewMode ? 'Customer Details' : customerId ? 'Edit Customer' : 'Add New Customer'}
        </h1>
        {customerId && isEditMode && (
          <button
            onClick={handleDelete}
            className="ml-auto flex items-center gap-2 text-red-600 hover:text-red-800"
          >
            <FiTrash2 /> Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow cursor-pointer"
                onClick={!isViewMode ? triggerFileInput : undefined}
              />
            ) : (
              <div 
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow cursor-pointer"
                onClick={!isViewMode ? triggerFileInput : undefined}
              >
                <FiUser className="text-gray-500 text-4xl" />
              </div>
            )}
            {!isViewMode && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <FiUpload className="text-lg" />
                </button>
              </>
            )}
          </div>
          {!isViewMode && (
            <p className="mt-2 text-sm text-gray-500">
              Click on the image to upload a new photo
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Form fields remain the same as previous implementation */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              readOnly={isViewMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                isViewMode 
                  ? 'bg-gray-100 border-gray-200 text-gray-700' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={isViewMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                isViewMode 
                  ? 'bg-gray-100 border-gray-200 text-gray-700' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={isViewMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                isViewMode 
                  ? 'bg-gray-100 border-gray-200 text-gray-700' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="customerType" className="block text-sm font-medium text-gray-700">
              Customer Type *
            </label>
            {isViewMode ? (
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700">
                {formData.customerType}
              </div>
            ) : (
              <select
                id="customerType"
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
                <option value="VIP">VIP</option>
              </select>
            )}
          </div>
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/customers')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <FiSave className="mr-2" />
                  {customerId ? 'Update Customer' : 'Add Customer'}
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

interface CustomerFormProps {
  customerId?: string;
  mode?: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  session?: unknown;
}