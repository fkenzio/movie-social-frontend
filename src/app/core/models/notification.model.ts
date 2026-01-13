export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  actor_id: number;
  actor: {
    id: number;
    username: string;
    full_name: string | null;
    email: string;
  };
  target_type: string | null;
  target_id: number | null;
  movie_tmdb_id: number | null;
  movie_title: string | null;
  content_preview: string | null;
  is_read: boolean;
  created_at: string;
}

export type NotificationType = 
  | 'like' 
  | 'comment'
  | 'reply';

export interface NotificationStats {
  total: number;
  unread: number;
}