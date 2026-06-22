import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { notificationApi } from '@/apis/notificationApi';

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationApi.unreadCount,
    refetchInterval: 60000,
  });
}

export function useNotifications() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['notifications'], queryFn: notificationApi.list });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  };

  const markRead = useMutation({ mutationFn: notificationApi.markRead, onSuccess: invalidate });
  const markAllRead = useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: invalidate });

  return { list, markRead, markAllRead };
}
