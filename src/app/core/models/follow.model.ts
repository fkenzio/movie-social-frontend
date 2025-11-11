import { User } from '@core/models/user.model';

export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

export interface FollowUser extends User {
  is_following: boolean;
  followers_count: number;
  following_count: number;
}