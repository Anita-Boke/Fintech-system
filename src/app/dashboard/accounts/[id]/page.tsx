import AccountForm from '@/components/accounts/AccountForm';

interface AccountDetailPageProps {
  params: {
    id: string;
  };
}

export default function AccountDetailPage({ params }: AccountDetailPageProps) {
  return <AccountForm accountId={params.id} />;
}