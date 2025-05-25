import TransactionForm from '@/components/transactions/TransactionForm';

interface TransactionDetailPageProps {
  params: {
    id: string;
  };
}

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  return <TransactionForm transactionId={params.id} />;
}