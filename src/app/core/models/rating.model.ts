import { User } from "./user.model";
import { Movie } from "./movie.model";

export interface Rating {
  id: number;
  user_id: number;
  user?: User;
  movie_id: number;
  movie?: Movie;
  rating: number; // 0-10
  created_at: string;
  updated_at: string;
}

export interface CreateRatingRequest {
  movie_id: number;
  rating: number;
}

export interface UpdateRatingRequest {
  rating: number;
}

export interface MovieRatingStats {
  movie_id: number;
  average_rating: number;
  total_ratings: number;
  rating_distribution: RatingDistribution;
}

export interface RatingDistribution {
  '10': number;
  '9': number;
  '8': number;
  '7': number;
  '6': number;
  '5': number;
  '4': number;
  '3': number;
  '2': number;
  '1': number;
}