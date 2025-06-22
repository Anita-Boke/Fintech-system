// src/app/dashboard/customers/new/page.tsx
'use client';

import CustomerForm from '@/components/customers/CustomerForm';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/customers');
  };

  return (
    <div>
      <CustomerForm onSuccess={handleSuccess} />
    </div>
  );
}