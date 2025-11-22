import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { RankingsService, RankingMovie, RankingResponse } from '../../services/rankings';
import { MovieApiService } from '@features/movies/services/movie-api';

@Component({
  selector: 'app-global-ranking',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './global-ranking.html',
  styleUrls: ['./global-ranking.scss']
})
export class GlobalRankingComponent implements OnInit {
  private rankingsService = inject(RankingsService);
  private movieApi = inject(MovieApiService);

  rankings: RankingMovie[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  selectedTab: 'tmdb' | 'users' | 'combined' | 'trending' = 'combined';
  minRatings = 1;

  ngOnInit(): void {
    this.loadRankings();
  }

  loadRankings(): void {
    this.isLoading = true;

    let observable;
    switch (this.selectedTab) {
      case 'tmdb':
        observable = this.rankingsService.getTmdbTopRated(this.currentPage);
        break;
      case 'users':
        // Usar el ranking combinado para obtener detalles de TMDB
        observable = this.rankingsService.getCombinedRanking(this.currentPage, 20, this.minRatings);
        break;
      case 'trending':
        observable = this.rankingsService.getTrendingThisWeek(this.currentPage);
        break;
      case 'combined':
      default:
        observable = this.rankingsService.getCombinedRanking(this.currentPage, 20, this.minRatings);
        break;
    }

    observable.subscribe({
      next: (response: RankingResponse) => {
        this.rankings = response.rankings;
        this.totalPages = response.total_pages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rankings:', error);
        this.isLoading = false;
      }
    });
  }

  changeTab(tab: 'tmdb' | 'users' | 'combined' | 'trending'): void {
    this.selectedTab = tab;
    this.currentPage = 1;
    this.loadRankings();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRankings();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getImageUrl(path: string): string {
    return this.movieApi.getImageUrl(path);
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#2ecc71';
    if (rating >= 3.5) return '#f39c12';
    return '#e74c3c';
  }

  getMedalEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
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