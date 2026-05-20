'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRole, getDefaultRoute } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    if (role) {
      router.replace(getDefaultRoute(role));
    }
  }, [router]);

  return null;
}
