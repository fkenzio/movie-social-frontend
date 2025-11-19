import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetail extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
  videos: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
  similar: MoviesResponse;
}

@Injectable({
  providedIn: 'root'
})
export class MovieApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/movies`;

  searchMovies(query: string, page: number = 1): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(`${this.apiUrl}/search`, {
      params: { query, page: page.toString() }
    });
  }

  getMovieDetails(movieId: number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(`${this.apiUrl}/details/${movieId}`);
  }

  getPopularMovies(page: number = 1): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(`${this.apiUrl}/popular`, {
      params: { page: page.toString() }
    });
  }

  getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(`${this.apiUrl}/trending`, {
      params: { time_window: timeWindow }
    });
  }

  getTopRatedMovies(page: number = 1): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(`${this.apiUrl}/top-rated`, {
      params: { page: page.toString() }
    });
  }

  getNowPlaying(page: number = 1): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(`${this.apiUrl}/now-playing`, {
      params: { page: page.toString() }
    });
  }

  getImageUrl(path: string, size: 'w200' | 'w500' | 'original' = 'w500'): string {
    if (!path) return 'assets/no-image.png';
    return `${environment.tmdbImageUrl}/${size}${path}`;
  }

  getBackdropUrl(path: string): string {
    if (!path) return '';
    return `${environment.tmdbImageUrl}/original${path}`;
  }
}