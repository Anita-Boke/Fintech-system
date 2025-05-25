import { Account } from '@/lib/constants';
import Link from 'next/link';

interface AccountCardProps {
  account: Account;
  onDelete: (id: string) => void;
}

export default function AccountCard({ account, onDelete }: AccountCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-black">{account.accountNumber}</h3>
          <p className="text-sm text-gray-600">Balance: ${account.balance.toFixed(2)}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          account.status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : account.status === 'Suspended'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        }`}>
          {account.status}
        </span>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className={`px-2 py-1 text-xs rounded ${
          account.accountType === 'Business' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {account.accountType}
        </span>
        <div className="flex space-x-2">
          <Link 
            href={`/dashboard/accounts/${account.id}`}
            className="text-primary hover:underline text-sm"
          >
            Edit
          </Link>
          <button 
            onClick={() => onDelete(account.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}