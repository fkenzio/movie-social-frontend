import { User } from "./user.model";
import { Movie } from "./movie.model";

export interface Review {
  id: number;
  user_id: number;
  user?: User;
  movie_id: number;
  movie?: Movie;
  title?: string;
  content: string;
  contains_spoilers: boolean;
  likes_count?: number;
  user_has_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewRequest {
  movie_id: number;
  title?: string;
  content: string;
  contains_spoilers: boolean;
}

export interface UpdateReviewRequest {
  title?: string;
  content?: string;
  contains_spoilers?: boolean;
}