export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  followers_count: number;
  following_count: number;
  lists_count: number;
  reviews_count: number;
  ratings_count: number;
  watched_movies_count: number;
  favorite_genres?: string[];
}

export interface UserStats {
  total_movies_watched: number;
  total_reviews: number;
  total_ratings: number;
  total_lists: number;
  average_rating: number;
  favorite_genre: string;
  most_watched_year: number;
}