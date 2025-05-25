import { Transaction } from '@/lib/constants';
import Link from 'next/link';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export default function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-black">{transaction.type}</h3>
          <p className="text-sm text-gray-600">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          transaction.status === 'Approved' 
            ? 'bg-green-100 text-green-800' 
            : transaction.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        }`}>
          ${transaction.amount.toFixed(2)}
        </span>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Status: {transaction.status}
        </span>
        <div className="flex space-x-2">
          <Link 
            href={`/dashboard/transactions/${transaction.id}`}
            className="text-primary hover:underline text-sm"
          >
            Edit
          </Link>
          <button 
            onClick={() => onDelete(transaction.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}