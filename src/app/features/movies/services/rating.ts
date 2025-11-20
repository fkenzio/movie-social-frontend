import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Rating {
  id: number;
  user_id: number;
  movie_tmdb_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface MovieRatingStats {
  movie_tmdb_id: number;
  tmdb_average: number;
  users_average: number;
  total_ratings: number;
  rating_distribution: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ratings`;

  createOrUpdateRating(movieTmdbId: number, rating: number): Observable<Rating> {
    return this.http.post<Rating>(`${this.apiUrl}/`, {
      movie_tmdb_id: movieTmdbId,
      rating: rating
    });
  }

  getUserRating(movieTmdbId: number): Observable<Rating | null> {
    return this.http.get<Rating | null>(`${this.apiUrl}/movie/${movieTmdbId}/user`);
  }

  getMovieStats(movieTmdbId: number, tmdbAverage: number): Observable<MovieRatingStats> {
    return this.http.get<MovieRatingStats>(`${this.apiUrl}/movie/${movieTmdbId}/stats`, {
      params: { tmdb_average: tmdbAverage.toString() }
    });
  }

  deleteRating(movieTmdbId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/movie/${movieTmdbId}`);
  }
}