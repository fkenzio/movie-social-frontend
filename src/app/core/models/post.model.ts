import { User } from "./user.model";
import { Movie } from "./movie.model";
import { Review } from "./review.model";
import { Rating } from "./rating.model";
import { MovieList } from "./list.model";

export interface Post {
  id: number;
  user_id: number;
  user: User;
  content?: string;
  post_type: PostType;
  reference_id?: number; // ID de la review, rating, lista, etc.
  movie_id?: number;
  movie?: Movie;
  review?: Review;
  rating?: Rating;
  list?: MovieList;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  created_at: string;
}

export type PostType = 'review' | 'rating' | 'list' | 'recommendation';

export interface CreatePostRequest {
  content?: string;
  post_type: PostType;
  reference_id?: number;
  movie_id?: number;
}