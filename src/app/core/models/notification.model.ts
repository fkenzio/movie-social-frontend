import { User } from "./user.model";

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  content: string;
  reference_id?: number;
  is_read: boolean;
  from_user?: User;
  created_at: string;
}

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'list_invite' 
  | 'recommendation'
  | 'new_follower_review'
  | 'list_movie_added';

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  notify_likes: boolean;
  notify_comments: boolean;
  notify_follows: boolean;
  notify_recommendations: boolean;
}