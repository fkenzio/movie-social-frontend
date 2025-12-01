import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { ProfileService } from '../../services/profile';
import { AuthService } from '@core/services/auth.service';
import { UserProfile, ActivityItem } from '@core/models/user-stats.model';
import { MovieApiService } from '@features/movies/services/movie-api';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieApi = inject(MovieApiService);

  profile: UserProfile | null = null;
  isLoading = true;
  isOwnProfile = false;
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      
      if (userId) {
        this.loadUserProfile(+userId);
      } else {
        this.loadMyProfile();
      }
    });
  }

  loadMyProfile(): void {
    this.isLoading = true;
    this.isOwnProfile = true;
    
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserProfile(userId: number): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    this.isOwnProfile = currentUser?.id === userId;
    
    this.profileService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });
  }

  getUserInitials(): string {
    if (!this.profile) return 'U';
    return this.profile.username.charAt(0).toUpperCase();
  }

  getMemberSince(): string {
    if (!this.profile) return '';
    const date = new Date(this.profile.created_at);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'rating': return '⭐';
      case 'review': return '📝';
      case 'list_created': return '📋';
      case 'list_movie_added': return '➕';
      default: return '🎬';
    }
  }

  getActivityText(activity: ActivityItem): string {
    switch(activity.activity_type) {
      case 'rating':
        return `Calificó con ${activity.rating?.toFixed(1)}`;
      case 'review':
        return 'Escribió una reseña de';
      case 'list_created':
        return `Creó la lista "${activity.list_name}"`;
      case 'list_movie_added':
        return `Agregó a la lista "${activity.list_name}"`;
      default:
        return '';
    }
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const created = new Date(dateString);
    const diff = now.getTime() - created.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return created.toLocaleDateString();
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return 'assets/no-image.png';
    return this.movieApi.getImageUrl(path);
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }
}
