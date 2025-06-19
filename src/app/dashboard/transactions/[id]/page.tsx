import TransactionForm from '@/components/transactions/TransactionForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface TransactionDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';
  
  return <TransactionForm transactionId={params.id} isAdmin={isAdmin} />;
}