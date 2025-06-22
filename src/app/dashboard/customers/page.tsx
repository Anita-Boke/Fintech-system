'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Customer, dummyCustomers } from '@/lib/constants';
import { getCustomerById, getAllCustomers } from '@/lib/services/customerService';
import { toast } from 'react-toastify';
import { FiEdit, FiUser, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Helper function to manage localStorage customers
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

export default function CustomerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get data from both sources
        const localStorageCustomers = getLocalStorageCustomers();
        const combinedDummyCustomers = [...dummyCustomers, ...localStorageCustomers];
        
        if (session.user.role === 'admin') {
          // Admin sees all customers from both sources
          setAllCustomers(combinedDummyCustomers);
          setCustomer(null);
          
          // In production, still fetch from API but combine with all sources
          if (process.env.NODE_ENV !== 'development') {
            try {
              const apiCustomers = await getAllCustomers();
              setAllCustomers([...apiCustomers, ...combinedDummyCustomers]);
            } catch (apiError) {
              console.warn('API failed, using local data:', apiError);
              setAllCustomers(combinedDummyCustomers);
            }
          }
        } else {
          // Customer sees their data from any source
          const matchedCustomer = combinedDummyCustomers.find(
            c => c.email === session.user?.email
          );
          
          if (matchedCustomer) {
            setCustomer(matchedCustomer);
            setAllCustomers([]);
          } else if (process.env.NODE_ENV !== 'development') {
            // Fallback to API in production
            try {
              const apiCustomer = await getCustomerById(session.user.id);
              if (apiCustomer) {
                setCustomer(apiCustomer);
                setAllCustomers([]);
              }
            } catch (apiError) {
              console.warn('API failed to load customer:', apiError);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  // Function to add a new customer to localStorage and update state
  const addCustomer = (newCustomer: Customer) => {
    const existingCustomers = getLocalStorageCustomers();
    const updatedCustomers = [...existingCustomers, newCustomer];
    saveLocalStorageCustomers(updatedCustomers);
    
    if (session?.user?.role === 'admin') {
      setAllCustomers(prev => [...prev, newCustomer]);
    }
    
    toast.success('Customer added successfully');
  };

  // Rest of your existing JSX remains exactly the same
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin' && !customer) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Customer Not Found</h1>
        <p className="text-black">No customer information available.</p>
      </div>
    );
  }


  return (
    <div className="p-6">
      {session?.user?.role === 'admin' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">Customer Management</h1>
            <button
              onClick={() => router.push('/dashboard/customers/new')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FiPlus /> Add Customer
            </button>
          </div>

          {allCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCustomers.map(customer => (
                <div key={customer.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    {customer.profilePicture ? (
                      <img 
                        src={customer.profilePicture} 
                        alt={customer.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-900 text-xl" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-black">{customer.fullName}</h3>
                      <p className="text-sm text-gray-900">{customer.customerType}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-900">Email</p>
                      <p className="truncate text-black">{customer.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-900">Phone</p>
                      <p className="text-black">{customer.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                    className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm border-t pt-3"
                  >
                    <FiEdit /> View/Edit Profile
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No customers found</p>
          )}
        </>
      ) : (
        customer && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-black">Welcome, {customer.fullName}</h1>
              <button
                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FiEdit /> Edit Profile
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center">
                  {customer.profilePicture ? (
                    <img 
                      src={customer.profilePicture} 
                      alt={customer.fullName}
                      className="w-32 h-32 rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <FiUser className="text-gray-900 text-4xl" />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Full Name</h3>
                    <p className="text-lg text-purple-600">{customer.fullName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Email</h3>
                    <p className="text-lg text-purple-600">{customer.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Phone</h3>
                    <p className="text-lg text-purple-600">{customer.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Customer Type</h3>
                    <p className="text-lg capitalize text-purple-600">{customer.customerType.toLowerCase()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Member Since</h3>
                    <p className="text-lg text-purple-600">{new Date(customer.dateOfRegistration).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}