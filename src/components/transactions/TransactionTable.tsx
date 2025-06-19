// src/components/transactions/TransactionTable.tsx
import { Transaction } from '@/lib/constants';
import Link from 'next/link';

interface TransactionTableProps {
  transactions: Transaction[];
  onStatusChange?: (id: string, status: 'Approved' | 'Rejected') => void;
  isAdmin?: boolean;
}

export default function TransactionTable({
  transactions,
  onStatusChange,
  isAdmin = false,
}: TransactionTableProps) {
  //const { data: session } = useSession();
  //const admin = session?.user?.role === 'admin' || isAdmin;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {transaction.type}
                {transaction.type === 'Transfer' && transaction.toAccountId && (
                  <span className="block text-xs text-gray-500">To: {transaction.toAccountId}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.accountId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${transaction.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isAdmin && transaction.status === 'Pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onStatusChange?.(transaction.id, 'Approved')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onStatusChange?.(transaction.id, 'Rejected')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className={`px-2 py-1 text-xs rounded ${
                    transaction.status === 'Approved' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.status === 'Rejected' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Link
                  href={`/dashboard/transactions/${transaction.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}