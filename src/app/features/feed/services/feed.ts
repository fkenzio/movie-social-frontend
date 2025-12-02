import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { FeedResponse } from '@core/models/feed.model';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/feed`;

  // Feed global de la comunidad
  getGlobalFeed(page: number = 1, limit: number = 20): Observable<FeedResponse> {
    return this.http.get<FeedResponse>(`${this.apiUrl}/`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Feed de un usuario específico
  getUserFeed(userId: number, page: number = 1, limit: number = 20): Observable<FeedResponse> {
    return this.http.get<FeedResponse>(`${this.apiUrl}/user/${userId}`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Mi feed personal
  getMyFeed(page: number = 1, limit: number = 20): Observable<FeedResponse> {
    return this.http.get<FeedResponse>(`${this.apiUrl}/me`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }
}