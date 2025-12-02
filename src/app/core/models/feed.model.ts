import { User } from './user.model';

export interface FeedItem {
  id: string;
  user_id: number;
  user: User;
  activity_type: 'rating' | 'review' | 'list_created' | 'list_movie_added';
  movie_tmdb_id?: number;
  movie_title?: string;
  movie_poster?: string;
  movie_backdrop?: string;
  movie_rating_tmdb?: number;
  rating?: number;
  review_title?: string;
  review_content?: string;
  review_contains_spoilers?: boolean;
  list_id?: number;
  list_name?: string;
  list_description?: string;
  created_at: string;
}

export interface FeedResponse {
  items: FeedItem[];
  page: number;
  total_pages: number;
  total_items: number;
}