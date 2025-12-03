import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '@core/models/user.model';

export interface FeedItem {
  id: string;
  user_id: number;
  user: User;
  activity_type: string;
  target_id: number;
  movie_tmdb_id?: number;
  movie_title?: string;
  movie_poster?: undefined;
  movie_backdrop?: string;
  movie_rating_tmdb?: number;
  rating?: number;
  review_title?: string;
  review_content?: string;
  review_contains_spoilers?: boolean;
  list_id?: number;
  list_name?: string;
  list_description?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  user_has_commented: boolean;
}

export interface FeedResponse {
  items: FeedItem[];
  page: number;
  total_pages: number;
  total_items: number;
}

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/feed`;

  getGlobalFeed(page: number = 1, limit: number = 20): Observable<FeedResponse> {
    return this.http.get<FeedResponse>(`${this.apiUrl}/`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getUserFeed(userId: number, page: number = 1, limit: number = 20): Observable<FeedResponse> {
    return this.http.get<FeedResponse>(`${this.apiUrl}/user/${userId}`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getMyFeed(page: number = 1, limit: number = 20): Observable<FeedResponse> {
    return this.http.get<FeedResponse>(`${this.apiUrl}/me`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }
}