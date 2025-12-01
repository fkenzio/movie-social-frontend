export interface UserStats {
  total_ratings: number;
  total_reviews: number;
  total_lists: number;
  movies_watched: number;
  average_rating: number;
  favorite_genre?: string;
  most_watched_year?: number;
}

export interface ActivityItem {
  id: number;
  activity_type: 'rating' | 'review' | 'list_created' | 'list_movie_added';
  movie_tmdb_id?: number;
  movie_title?: string;
  movie_poster?: string;
  content?: string;
  rating?: number;
  list_name?: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  stats: UserStats;
  recent_activity: ActivityItem[];
}