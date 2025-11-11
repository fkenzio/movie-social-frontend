import { User} from '@core/models/user.model';

export interface Comment {
  id: number;
  user_id: number;
  user: User;
  post_id: number;
  content: string;
  parent_id?: number;
  replies?: Comment[];
  replies_count?: number;
  created_at: string;
}

export interface CreateCommentRequest {
  post_id: number;
  content: string;
  parent_id?: number;
}