import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { RecommendationsService, RecommendedMovie, RecommendationsResponse } from '../../services/recommendations';
import { MovieApiService } from '@features/movies/services/movie-api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.scss']
})
export class RecommendationsComponent implements OnInit {
  private recommendationsService = inject(RecommendationsService);
  private movieApi = inject(MovieApiService);
  private toastr = inject(ToastrService);

  personalizedRecommendations: RecommendedMovie[] = [];
  trendingRecommendations: RecommendedMovie[] = [];
  genreRecommendations: RecommendedMovie[] = [];
  
  isLoadingPersonalized = true;
  isLoadingTrending = true;
  isLoadingGenre = true;
  
  algorithm: string = '';
  basedOnRatings: number = 0;
  
  selectedTab: 'personalized' | 'trending' | 'genre' = 'personalized';

  ngOnInit(): void {
    this.loadAllRecommendations();
  }

  loadAllRecommendations(): void {
    this.loadPersonalized();
    this.loadTrending();
    this.loadByGenre();
  }

  loadPersonalized(): void {
    this.isLoadingPersonalized = true;
    this.recommendationsService.getPersonalizedRecommendations(20).subscribe({
      next: (response) => {
        this.personalizedRecommendations = response.recommendations;
        this.algorithm = response.algorithm;
        this.basedOnRatings = response.based_on_ratings;
        this.isLoadingPersonalized = false;
      },
      error: (error) => {
        console.error('Error loading personalized:', error);
        this.isLoadingPersonalized = false;
        if (error.status === 400) {
          this.toastr.info('Califica más películas para obtener recomendaciones personalizadas', 'Info');
        }
      }
    });
  }

  loadTrending(): void {
    this.isLoadingTrending = true;
    this.recommendationsService.getTrendingForUser(20).subscribe({
      next: (movies) => {
        this.trendingRecommendations = movies;
        this.isLoadingTrending = false;
      },
      error: (error) => {
        console.error('Error loading trending:', error);
        this.isLoadingTrending = false;
      }
    });
  }

  loadByGenre(): void {
    this.isLoadingGenre = true;
    this.recommendationsService.getByFavoriteGenre(20).subscribe({
      next: (movies) => {
        this.genreRecommendations = movies;
        this.isLoadingGenre = false;
      },
      error: (error) => {
        console.error('Error loading by genre:', error);
        this.isLoadingGenre = false;
      }
    });
  }

  changeTab(tab: 'personalized' | 'trending' | 'genre'): void {
    this.selectedTab = tab;
  }

  getImageUrl(path: string): string {
    return this.movieApi.getImageUrl(path);
  }

  getRatingColor(rating: number): string {
    if (rating >= 8) return '#2ecc71';
    if (rating >= 6) return '#f39c12';
    return '#e74c3c';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#2ecc71';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  }

  getAlgorithmIcon(): string {
    switch (this.algorithm) {
      case 'collaborative':
        return '👥';
      case 'content_based':
        return '🎬';
      case 'hybrid':
        return '🔮';
      default:
        return '🤖';
    }
  }

  getAlgorithmName(): string {
    switch (this.algorithm) {
      case 'collaborative':
        return 'Filtrado Colaborativo';
      case 'content_based':
        return 'Basado en Contenido';
      case 'hybrid':
        return 'Híbrido';
      default:
        return 'IA';
    }
  }
}