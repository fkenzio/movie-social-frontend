import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface RecommendedMovie {
  movie_tmdb_id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  overview: string;
  release_date: string;
  vote_average: number;
  score: number; // Score de recomendación (0-100)
  reason: string; // Por qué se recomienda
}

export interface RecommendationsResponse {
  recommendations: RecommendedMovie[];
  algorithm: 'collaborative' | 'content_based' | 'hybrid';
  based_on_ratings: number; // Cantidad de ratings del usuario
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recommendations`;

  /**
   * Obtener recomendaciones personalizadas para el usuario actual
   * Usa filtrado colaborativo basado en usuarios similares
   */
  getPersonalizedRecommendations(limit: number = 20): Observable<RecommendationsResponse> {
    return this.http.get<RecommendationsResponse>(`${this.apiUrl}/personalized`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Obtener películas similares basadas en una película específica
   * Usa content-based filtering
   */
  getSimilarMovies(movieId: number, limit: number = 10): Observable<RecommendedMovie[]> {
    return this.http.get<RecommendedMovie[]>(`${this.apiUrl}/similar/${movieId}`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Obtener recomendaciones basadas en género favorito
   */
  getByFavoriteGenre(limit: number = 20): Observable<RecommendedMovie[]> {
    return this.http.get<RecommendedMovie[]>(`${this.apiUrl}/by-genre`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Obtener películas trending que el usuario no ha visto
   */
  getTrendingForUser(limit: number = 20): Observable<RecommendedMovie[]> {
    return this.http.get<RecommendedMovie[]>(`${this.apiUrl}/trending`, {
      params: { limit: limit.toString() }
    });
  }
}