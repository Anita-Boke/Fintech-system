'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getUserById } from '@/lib/services/userService';
import { getCustomerByUserId, getCustomers } from '@/lib/services/customerService';
import { toast } from 'react-toastify';
import { Customer } from '@/lib/constants';
import { FiEdit, FiUser, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Dummy data imports
import { dummyCustomers } from '@/lib/constants';

export default function CustomerDashboard() {
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
        
        // Get user role
        const user = await getUserById(session.user.id);
        const isAdmin = user?.role === 'admin';
        
        if (process.env.NODE_ENV === 'development') {
          // Use dummy data in development
          if (isAdmin) {
            setAllCustomers(dummyCustomers);
          } else {
            setCustomer(dummyCustomers[0]);
          }
          setLoading(false);
          return;
        }

        if (isAdmin) {
          try {
            // Admin sees all customers
            const customersData = await getCustomers();
            setAllCustomers(customersData);
          } catch (apiError) {
            console.error('API failed:', apiError);
            setAllCustomers(dummyCustomers);
            toast.error('Failed to load customer data');
          }
        } else {
          // Customer sees only their data
          try {
            const customerData = await getCustomerByUserId(session.user.id);
            if (!customerData) {
              toast.error('Customer not found');
              return;
            }
            setCustomer(customerData);
          } catch (apiError) {
            console.error('API failed:', apiError);
            setCustomer(dummyCustomers[0]);
            toast.error('Failed to load your profile');
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

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
      <p className='text-black'>No customer information available.</p>
    </div>
  );
}

  return (
    <div className="p-6">
      {session?.user?.role === 'admin' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Customer Management</h1>
            <button
              onClick={() => router.push('/customers/new')}
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
                      <h3 className="font-bold text-lg">{customer.fullName}</h3>
                      <p className="text-sm text-gray-900">{customer.customerType}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-900">Email</p>
                      <p className="truncate">{customer.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-900">Phone</p>
                      <p>{customer.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/customers/${customer.id}`)}
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
                onClick={() => router.push('/profile/edit')}
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