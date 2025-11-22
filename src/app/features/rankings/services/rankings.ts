import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface RankingMovie {
  rank: number;
  movie_tmdb_id: number;
  title?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  overview?: string;
  genres?: { id: number; name: string }[];
  tmdb_rating?: number;
  tmdb_votes?: number;
  users_average?: number;
  total_ratings?: number;
  popularity?: number;
}

export interface RankingResponse {
  rankings: RankingMovie[];
  page: number;
  total_pages: number;
  total_results: number;
  source: 'tmdb' | 'users' | 'combined' | 'trending' | 'users_stats';
  min_ratings_required?: number;
}

export interface UserRanking {
  rank: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  total_ratings: number;
  average_rating_given: number;
}

@Injectable({
  providedIn: 'root'
})
export class RankingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rankings`;

  /**
   * Obtener ranking de TMDB (top rated)
   */
  getTmdbTopRated(page: number = 1, limit: number = 20): Observable<RankingResponse> {
    return this.http.get<RankingResponse>(`${this.apiUrl}/tmdb/top-rated`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Obtener ranking de usuarios de Cineminha
   */
  getUsersTopRated(page: number = 1, limit: number = 20, minRatings: number = 5): Observable<RankingResponse> {
    return this.http.get<RankingResponse>(`${this.apiUrl}/users/top-rated`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        min_ratings: minRatings.toString()
      }
    });
  }

  /**
   * Obtener ranking combinado (TMDB + Usuarios)
   */
  getCombinedRanking(page: number = 1, limit: number = 20, minRatings: number = 3): Observable<RankingResponse> {
    return this.http.get<RankingResponse>(`${this.apiUrl}/combined`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        min_ratings: minRatings.toString()
      }
    });
  }

  /**
   * Obtener películas en tendencia
   */
  getTrendingThisWeek(page: number = 1): Observable<RankingResponse> {
    return this.http.get<RankingResponse>(`${this.apiUrl}/trending`, {
      params: { page: page.toString() }
    });
  }

  /**
   * Obtener ranking de usuarios más activos
   */
  getUsersStatsRanking(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/users-stats`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }
}