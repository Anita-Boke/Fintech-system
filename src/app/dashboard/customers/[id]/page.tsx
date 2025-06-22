'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Customer, dummyCustomers } from '@/lib/constants';
import { getCustomerById } from '@/lib/services/customerService';
import { toast } from 'react-toastify';
import CustomerForm from '@/components/customers/CustomerForm';

// Helper functions for localStorage customers
const getLocalStorageCustomers = (): Customer[] => {
  if (typeof window !== 'undefined') {
    const storedCustomers = localStorage.getItem('customers');
    return storedCustomers ? JSON.parse(storedCustomers) : [];
  }
  return [];
};

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { data: session } = useSession();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        
        // Check localStorage first
        const localStorageCustomers = getLocalStorageCustomers();
        const localCustomer = localStorageCustomers.find(c => c.id === params.id);
        
        if (localCustomer) {
          // Verify access permissions
          const isAdmin = session.user.role === 'admin';
          if (!isAdmin && localCustomer.email !== session.user.email) {
            toast.error('You can only view your own profile');
            return;
          }
          setCustomer(localCustomer);
          setLoading(false);
          return;
        }

        // In development, use dummy data if available
        if (process.env.NODE_ENV === 'development') {
          const dummyCustomer = dummyCustomers.find(c => c.id === params.id);
          if (dummyCustomer) {
            // Verify access permissions for dummy data
            const isAdmin = session.user.role === 'admin';
            if (!isAdmin && dummyCustomer.email !== session.user.email) {
              toast.error('You can only view your own profile');
              return;
            }
            setCustomer(dummyCustomer);
            setLoading(false);
            return;
          }
        }

        // Fetch from API in production
        const fetchedCustomer = await getCustomerById(params.id);
        
        if (!fetchedCustomer) {
          toast.error('Customer not found');
          return;
        }
        
        // Verify admin can view any customer, regular users can only view their own
        const isAdmin = session.user.role === 'admin';
        if (!isAdmin && fetchedCustomer.email !== session.user.email) {
          toast.error('You can only view your own profile');
          return;
        }

        setCustomer(fetchedCustomer);
      } catch (error) {
        console.error('Failed to load customer:', error);
        toast.error('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [session, params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Customer Not Found</h1>
        <p>No customer information available.</p>
      </div>
    );
  }

  function handleSuccess(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {session?.user?.role === 'admin' ? 'Customer Details' : 'My Profile'}
      </h1>
      <CustomerForm 
        customerId={customer.id} 
        mode="view" 
        onSuccess={handleSuccess}
  session={session} 
      />
    </div>
  );
}