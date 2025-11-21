import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface MovieList {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  is_public: boolean;
  is_collaborative: boolean;
  created_at: string;
  updated_at: string;
  movies_count: number;
}

export interface MovieInList {
  movie_tmdb_id: number;
  added_at: string;
  position: number;
}

export interface ListDetail extends MovieList {
  movies: MovieInList[];
}

export interface ListCheckResult {
  list_id: number;
  list_name: string;
  in_list: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ListsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lists`;

  createList(name: string, description?: string, isPublic: boolean = true): Observable<MovieList> {
    return this.http.post<MovieList>(`${this.apiUrl}/`, {
      name,
      description,
      is_public: isPublic,
      is_collaborative: false
    });
  }

  getMyLists(): Observable<MovieList[]> {
    return this.http.get<MovieList[]>(`${this.apiUrl}/`);
  }

  getListDetail(listId: number): Observable<ListDetail> {
    return this.http.get<ListDetail>(`${this.apiUrl}/${listId}`);
  }

  updateList(listId: number, data: { name?: string; description?: string; is_public?: boolean }): Observable<MovieList> {
    return this.http.put<MovieList>(`${this.apiUrl}/${listId}`, data);
  }

  deleteList(listId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${listId}`);
  }

  addMovieToList(listId: number, movieId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${listId}/movies/${movieId}`, {});
  }

  removeMovieFromList(listId: number, movieId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${listId}/movies/${movieId}`);
  }

  checkMovieInLists(movieId: number): Observable<ListCheckResult[]> {
    return this.http.get<ListCheckResult[]>(`${this.apiUrl}/check/${movieId}`);
  }
}