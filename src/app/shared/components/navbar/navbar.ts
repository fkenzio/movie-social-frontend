import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification';
import { User } from '@core/models/user.model';
import { Notification } from '@core/models/notification.model';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  currentUser: User | null = null;
  isMenuOpen = false;
  isMobileMenuOpen = false;
  
  // Notificaciones
  isNotificationsOpen = false;
  unreadCount = 0;
  notifications: Notification[] = [];
  isLoadingNotifications = false;
  
  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user) {
        // Iniciar sistema de notificaciones
        this.initNotifications();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.notificationService.disconnect();
  }

  private initNotifications(): void {
    // Cargar estadísticas iniciales
    this.notificationService.getStats().subscribe();
    
    // Suscribirse al contador de no leídas
    const unreadSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.add(unreadSub);
    
    // Suscribirse a la lista de notificaciones
    const notifSub = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.slice(0, 10); // Mostrar solo las 10 más recientes
    });
    this.subscriptions.add(notifSub);
    
    // Suscribirse a nuevas notificaciones en tiempo real
    const newNotifSub = this.notificationService.newNotification$.subscribe(notification => {
      // Mostrar toast de nueva notificación
      const message = this.notificationService.getNotificationMessage(notification);
      this.toastr.info(message, '🔔 Nueva notificación', {
        timeOut: 5000,
        progressBar: true
      });
    });
    this.subscriptions.add(newNotifSub);
    
    // Conectar al stream SSE
    const token = this.authService.getToken();
    if (token) {
      this.notificationService.connectToNotificationStream(token);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isNotificationsOpen) {
      this.isNotificationsOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
    
    // Debug log
    console.log('🔔 Toggling notifications:', {
      isOpen: this.isNotificationsOpen,
      currentNotifications: this.notifications.length,
      unreadCount: this.unreadCount
    });
    
    if (this.isNotificationsOpen && this.notifications.length === 0) {
      // Cargar notificaciones si aún no se han cargado
      this.loadNotifications();
    }
  }

  private loadNotifications(): void {
    console.log('📡 Loading notifications...');
    this.isLoadingNotifications = true;
    this.notificationService.getNotifications(0, 10).subscribe({
      next: (notifications) => {
        console.log('✅ Notifications loaded:', notifications);
        this.isLoadingNotifications = false;
      },
      error: (error) => {
        console.error('❌ Error loading notifications:', error);
        this.isLoadingNotifications = false;
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    // Marcar como leída
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    
    // Navegar al destino según el tipo
    this.navigateToNotificationTarget(notification);
    
    // Cerrar dropdown
    this.isNotificationsOpen = false;
  }

  private navigateToNotificationTarget(notification: Notification): void {
    // Lógica de navegación según el tipo y target
    if (notification.movie_tmdb_id) {
      this.router.navigate(['/movies', notification.movie_tmdb_id]);
    } else if (notification.target_type === 'list' && notification.target_id) {
      this.router.navigate(['/lists', notification.target_id]);
    }
    // Puedes agregar más navegación específica según tus rutas
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.toastr.success('Todas las notificaciones marcadas como leídas');
    });
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.isNotificationsOpen = false;
  }

  getNotificationMessage(notification: Notification): string {
    return this.notificationService.getNotificationMessage(notification);
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getTimeAgo(dateString: string): string {
    return this.notificationService.getTimeAgo(dateString);
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  closeAllMenus(): void {
    this.isMenuOpen = false;
    this.isMobileMenuOpen = false;
    this.isNotificationsOpen = false;
  }

  logout(): void {
    this.notificationService.disconnect();
    this.authService.logout();
    this.closeAllMenus();
  }
}