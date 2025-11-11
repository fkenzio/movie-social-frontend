import { Movie } from "./movie.model";

export interface Recommendation {
  id: number;
  movie: Movie;
  score: number; // 0-100
  reason: string;
  based_on?: Movie[]; // Películas en las que se basó
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  algorithm: 'collaborative' | 'content_based' | 'hybrid';
}