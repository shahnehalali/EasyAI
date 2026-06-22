import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const loadSession = useAuthStore((s) => s.loadSession);
  const can = (perm) => Array.isArray(user?.permissions) && user.permissions.includes(perm);
  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isAdmin: user?.role === 'platform_admin',
    can,
    setUser,
    logout,
    loadSession,
  };
}
