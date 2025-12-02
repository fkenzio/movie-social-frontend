import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { FeedService } from '../../services/feed';
import { AuthService } from '@core/services/auth.service';
import { MovieApiService } from '@features/movies/services/movie-api';
import { FeedItem } from '@core/models/feed.model';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './social-feed.html',
  styleUrls: ['./social-feed.scss']
})
export class SocialFeedComponent implements OnInit {
  private feedService = inject(FeedService);
  private authService = inject(AuthService);
  private movieApi = inject(MovieApiService);

  feedItems: FeedItem[] = [];
  currentUser: User | null = null;
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadFeed();
  }

  loadFeed(): void {
    this.isLoading = true;
    
    this.feedService.getGlobalFeed(this.currentPage, 20).subscribe({
      next: (response) => {
        this.feedItems = response.items;
        this.totalPages = response.total_pages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading feed:', error);
        this.isLoading = false;
      }
    });
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'rating': return '⭐';
      case 'review': return '📝';
      case 'list_created': return '📋';
      default: return '🎬';
    }
  }

  getActivityTitle(item: FeedItem): string {
    switch(item.activity_type) {
      case 'rating':
        return `calificó con ${item.rating?.toFixed(1)} estrellas`;
      case 'review':
        return 'escribió una reseña de';
      case 'list_created':
        return `creó la lista "${item.list_name}"`;
      default:
        return '';
    }
  }

  getActivityBadge(type: string): string {
    switch(type) {
      case 'rating': return 'Calificación';
      case 'review': return 'Reseña';
      case 'list_created': return 'Lista';
      default: return 'Actividad';
    }
  }

  getUserInitials(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return 'assets/no-image.png';
    return this.movieApi.getImageUrl(path);
  }

  getBackdropUrl(path: string | undefined): string {
    if (!path) return '';
    return this.movieApi.getBackdropUrl(path);
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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFeed();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}