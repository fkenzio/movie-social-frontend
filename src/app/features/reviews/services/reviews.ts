import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '@core/models/user.model';

export interface Review {
  id: number;
  user_id: number;
  movie_tmdb_id: number;
  title?: string;
  content: string;
  contains_spoilers: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateReviewRequest {
  movie_tmdb_id: number;
  title?: string;
  content: string;
  contains_spoilers: boolean;
}

export interface UpdateReviewRequest {
  title?: string;
  content?: string;
  contains_spoilers?: boolean;
}

export interface MovieReviewsStats {
  movie_tmdb_id: number;
  total_reviews: number;
  has_spoilers: number;
  without_spoilers: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;

  /**
   * Crear una reseña
   */
  createReview(review: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/`, review);
  }

  /**
   * Obtener reseñas de una película
   */
  getMovieReviews(
    movieId: number, 
    skip: number = 0, 
    limit: number = 10,
    includeSpoilers: boolean = true
  ): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/movie/${movieId}`, {
      params: {
        skip: skip.toString(),
        limit: limit.toString(),
        include_spoilers: includeSpoilers.toString()
      }
    });
  }

  /**
   * Obtener estadísticas de reseñas de una película
   */
  getMovieReviewsStats(movieId: number): Observable<MovieReviewsStats> {
    return this.http.get<MovieReviewsStats>(`${this.apiUrl}/movie/${movieId}/stats`);
  }

  /**
   * Obtener la reseña del usuario actual para una película
   */
  getUserReviewForMovie(movieId: number): Observable<Review | null> {
    return this.http.get<Review | null>(`${this.apiUrl}/movie/${movieId}/user`);
  }

  /**
   * Obtener todas las reseñas de un usuario
   */
  getUserReviews(userId: number, skip: number = 0, limit: number = 10): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/${userId}`, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  /**
   * Obtener reseñas recientes
   */
  getRecentReviews(skip: number = 0, limit: number = 20): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/recent`, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  /**
   * Obtener una reseña por ID
   */
  getReview(reviewId: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${reviewId}`);
  }

  /**
   * Actualizar una reseña
   */
  updateReview(reviewId: number, review: UpdateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, review);
  }

  /**
   * Eliminar una reseña
   */
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }
}