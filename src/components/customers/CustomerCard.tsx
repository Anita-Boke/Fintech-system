import { Customer } from '@/lib/constants';
import Link from 'next/link';

interface CustomerCardProps {
  customer: Customer;
  onDelete: (id: string) => void;
}

export default function CustomerCard({ customer, onDelete }: CustomerCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center space-x-4">
          {customer.profilePicture ? (
            <img 
              src={customer.profilePicture} 
              alt={customer.fullName}
              className="h-14 w-14 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-300 flex items-center justify-center text-white font-bold text-xl">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{customer.fullName}</h3>
            <p className="text-sm text-gray-500 truncate">{customer.email}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{customer.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          customer.customerType === 'Business' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {customer.customerType}
        </span>
        
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/customers/${customer.id}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit customer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </Link>
          <button
            onClick={() => onDelete(customer.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete customer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}