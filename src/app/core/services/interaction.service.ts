import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface InteractionStats {
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  user_has_commented: boolean;
}

export interface Comment {
  id: number;
  user_id: number;
  user: any;
  target_type: string;
  target_id: number;
  content: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  replies_count: number;
  likes_count: number;
  user_has_liked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/interactions`;

  // ==================== LIKES ====================
  
  toggleLike(targetType: string, targetId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/like`, {
      target_type: targetType,
      target_id: targetId
    });
  }

  getStats(targetType: string, targetId: number): Observable<InteractionStats> {
    return this.http.get<InteractionStats>(`${this.apiUrl}/stats`, {
      params: { target_type: targetType, target_id: targetId.toString() }
    });
  }

  // ==================== COMMENTS ====================
  
  createComment(
    targetType: string,
    targetId: number,
    content: string,
    parentId?: number
  ): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, {
      target_type: targetType,
      target_id: targetId,
      content,
      parent_id: parentId
    });
  }

  getComments(
    targetType: string,
    targetId: number,
    skip: number = 0,
    limit: number = 50
  ): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments`, {
      params: {
        target_type: targetType,
        target_id: targetId.toString(),
        skip: skip.toString(),
        limit: limit.toString()
      }
    });
  }

  getCommentReplies(
    commentId: number,
    skip: number = 0,
    limit: number = 20
  ): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/${commentId}/replies`, {
      params: {
        skip: skip.toString(),
        limit: limit.toString()
      }
    });
  }

  updateComment(commentId: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}`, {
      content
    });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comments/${commentId}`);
  }

  // ==================== SHARE ====================
  
  generateShareUrl(targetType: string, targetId: number): string {
    const baseUrl = window.location.origin;
    switch (targetType) {
      case 'review':
        return `${baseUrl}/reviews/${targetId}`;
      case 'rating':
        return `${baseUrl}/ratings/${targetId}`;
      case 'list':
        return `${baseUrl}/lists/detail/${targetId}`;
      default:
        return baseUrl;
    }
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }
}