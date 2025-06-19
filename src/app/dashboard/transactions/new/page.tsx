import TransactionForm from '@/components/transactions/TransactionForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';
  
  return <TransactionForm isAdmin={isAdmin} />;
}