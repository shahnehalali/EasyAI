import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AppRoutes from '@/routes';

export default function App() {
  const { loadSession } = useAuth();
  useEffect(() => { loadSession(); }, [loadSession]);
  return <AppRoutes />;
}
