import CustomerForm from '@/components/customers/CustomerForm';

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  return <CustomerForm customerId={params.id} />;
}