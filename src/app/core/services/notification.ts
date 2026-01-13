import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Notification, NotificationStats } from '@core/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // Estado de notificaciones
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private newNotificationSubject = new Subject<Notification>();
  
  // Observables públicos
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();
  newNotification$ = this.newNotificationSubject.asObservable();
  
  // SSE
  private eventSource: EventSource | null = null;
  private isConnected = false;

  constructor() {}

  // ========== CRUD OPERATIONS ==========

  /**
   * Obtener notificaciones del usuario
   */
  getNotifications(skip: number = 0, limit: number = 20, unreadOnly: boolean = false): Observable<Notification[]> {
    const params: any = { skip, limit };
    if (unreadOnly) {
      params.unread_only = true;
    }
    
    return this.http.get<Notification[]>(this.apiUrl, { params }).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
      })
    );
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  getStats(): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.apiUrl}/stats`).pipe(
      tap(stats => {
        this.unreadCountSubject.next(stats.unread);
      })
    );
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(notificationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Actualizar localmente
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        this.notificationsSubject.next(updatedNotifications);
        
        // Decrementar contador
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));
      })
    );
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        // Actualizar todas localmente
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(n => ({ ...n, is_read: true }));
        this.notificationsSubject.next(updatedNotifications);
        
        // Resetear contador
        this.unreadCountSubject.next(0);
      })
    );
  }

  /**
   * Eliminar notificación
   */
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        // Remover localmente
        const currentNotifications = this.notificationsSubject.value;
        const notification = currentNotifications.find(n => n.id === notificationId);
        const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(updatedNotifications);
        
        // Decrementar contador si no estaba leída
        if (notification && !notification.is_read) {
          const currentCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(Math.max(0, currentCount - 1));
        }
      })
    );
  }

  // ========== SERVER-SENT EVENTS (SSE) ==========

  /**
   * Conectar al stream de notificaciones en tiempo real
   */
  connectToNotificationStream(token: string): void {
    if (this.isConnected || !token) {
      return;
    }

    try {
      // Crear conexión SSE
      const url = `${this.apiUrl}/stream`;
      this.eventSource = new EventSource(url, {
        withCredentials: true
      });

      // Cuando se abre la conexión
      this.eventSource.onopen = () => {
        console.log('✅ SSE Connection established');
        this.isConnected = true;
      };

      // Cuando llega un mensaje (nueva notificación)
      this.eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          
          // Agregar al inicio de la lista
          const currentNotifications = this.notificationsSubject.value;
          this.notificationsSubject.next([notification, ...currentNotifications]);
          
          // Incrementar contador de no leídas
          const currentCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(currentCount + 1);
          
          // Emitir evento de nueva notificación para mostrar toast/alert
          this.newNotificationSubject.next(notification);
          
          console.log('📬 New notification received:', notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      // Manejo de errores
      this.eventSource.onerror = (error) => {
        console.error('❌ SSE Error:', error);
        this.disconnect();
        
        // Intentar reconectar después de 5 segundos
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('🔄 Attempting to reconnect...');
            this.connectToNotificationStream(token);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Error creating SSE connection:', error);
    }
  }

  /**
   * Desconectar del stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('🔌 SSE Connection closed');
    }
  }

  /**
   * Verificar si está conectado
   */
  isStreamConnected(): boolean {
    return this.isConnected;
  }

  // ========== HELPERS ==========

  /**
   * Obtener mensaje formateado de la notificación
   */
  getNotificationMessage(notification: Notification): string {
    const actor = notification.actor.username;
    
    switch (notification.type) {
      case 'like':
        if (notification.target_type === 'rating') {
          return `A ${actor} le gustó tu calificación${notification.movie_title ? ` de "${notification.movie_title}"` : ''}`;
        } else if (notification.target_type === 'review') {
          return `A ${actor} le gustó tu reseña${notification.movie_title ? ` de "${notification.movie_title}"` : ''}`;
        } else if (notification.target_type === 'list') {
          return `A ${actor} le gustó tu lista`;
        } else if (notification.target_type === 'comment') {
          return `A ${actor} le gustó tu comentario`;
        }
        return `A ${actor} le gustó tu publicación`;
      
      case 'comment':
        if (notification.target_type === 'rating') {
          return `${actor} comentó en tu calificación${notification.movie_title ? ` de "${notification.movie_title}"` : ''}`;
        } else if (notification.target_type === 'review') {
          return `${actor} comentó en tu reseña${notification.movie_title ? ` de "${notification.movie_title}"` : ''}`;
        } else if (notification.target_type === 'list') {
          return `${actor} comentó en tu lista`;
        }
        return `${actor} comentó en tu publicación`;
      
      case 'reply':
        return `${actor} respondió a tu comentario`;
      
      default:
        return `Nueva notificación de ${actor}`;
    }
  }

  /**
   * Obtener icono de la notificación
   */
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      like: '❤️',
      comment: '💬',
      reply: '↩️'
    };
    return icons[type] || '🔔';
  }

  /**
   * Obtener tiempo transcurrido desde la notificación
   */
  getTimeAgo(dateString: string): string {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return created.toLocaleDateString();
  }
}