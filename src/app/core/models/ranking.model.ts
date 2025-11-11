import { Movie } from "@features/movies/services/movie";

export interface MovieRanking {
  rank: number;
  movie: Movie;
  average_rating: number;
  total_ratings: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface RankingResponse {
  rankings: MovieRanking[];
  period: RankingPeriod;
  genre?: string;
  page: number;
  total_pages: number;
}

export type RankingPeriod = 'week' | 'month' | 'year' | 'all_time';