import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserProfile, UserStats, ActivityItem } from '@core/models/user-stats.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  // Obtener perfil completo del usuario actual
  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me/profile`);
  }

  // Obtener solo estadísticas del usuario actual
  getMyStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/me/stats`);
  }

  // Obtener actividad reciente del usuario actual
  getMyActivity(limit: number = 20): Observable<{ activities: ActivityItem[]; total: number }> {
    return this.http.get<{ activities: ActivityItem[]; total: number }>(
      `${this.apiUrl}/me/activity`,
      { params: { limit: limit.toString() } }
    );
  }

  // Obtener perfil de cualquier usuario (público)
  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}/profile`);
  }

  // Obtener estadísticas de cualquier usuario (público)
  getUserStats(userId: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/${userId}/stats`);
  }
}