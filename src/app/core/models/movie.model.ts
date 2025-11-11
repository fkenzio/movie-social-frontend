export interface Movie {
  id: number;
  external_id: string;
  title: string;
  original_title?: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date: string;
  runtime?: number;
  genres: Genre[];
  director?: string;
  cast?: CastMember[];
  average_rating: number;
  rating_count: number;
  user_rating?: number; // Rating del usuario actual
  user_has_reviewed?: boolean;
  created_at: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

export interface MovieSearchResult {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetail extends Movie {
  tagline?: string;
  budget?: number;
  revenue?: number;
  status: string;
  production_companies?: ProductionCompany[];
  videos?: Video[];
  similar_movies?: Movie[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}