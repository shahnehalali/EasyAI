import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AppRoutes from '@/routes';
import ScrollRestoration from '@/components/ScrollRestoration';

export default function App() {
  const { loadSession } = useAuth();
  useEffect(() => { loadSession(); }, [loadSession]);
  return (
    <>
      <ScrollRestoration />
      <AppRoutes />
    </>
  );
}
