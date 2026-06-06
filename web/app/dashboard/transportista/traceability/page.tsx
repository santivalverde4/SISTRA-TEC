import { Suspense } from 'react';
import { TransportTraceability } from '@/components/transportista/TransportTraceability';

export default function TransportTraceabilityPage() {
  return (
    <Suspense>
      <TransportTraceability />
    </Suspense>
  );
}
