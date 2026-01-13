import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { RecommendationsService, RecommendedMovie } from '../../services/recommendations';
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
  
  algorithm: string = 'trending';
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
      next: (movies) => {
        console.log('✅ Recomendaciones recibidas:', movies);
        
        // El backend devuelve un array directo
        this.personalizedRecommendations = movies;
        
        // Intentar detectar el algoritmo basado en los datos
        if (movies.length > 0 && movies[0].reason) {
          if (movies[0].reason.includes('Tendencia')) {
            this.algorithm = 'trending';
          } else if (movies[0].reason.includes('usuarios similares')) {
            this.algorithm = 'collaborative';
          } else {
            this.algorithm = 'content_based';
          }
        }
        
        this.isLoadingPersonalized = false;
      },
      error: (error) => {
        console.error('❌ Error loading personalized:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.error);
        this.isLoadingPersonalized = false;
        
        if (error.status === 400) {
          this.toastr.info('Califica más películas para obtener recomendaciones personalizadas', 'Info');
        } else {
          this.toastr.error('Error al cargar recomendaciones', 'Error');
        }
      }
    });
  }

  loadTrending(): void {
    this.isLoadingTrending = true;
    this.recommendationsService.getTrendingForUser(20).subscribe({
      next: (movies) => {
        console.log('✅ Trending recibidas:', movies);
        this.trendingRecommendations = movies;
        this.isLoadingTrending = false;
      },
      error: (error) => {
        console.error('❌ Error loading trending:', error);
        this.isLoadingTrending = false;
        this.toastr.error('Error al cargar tendencias', 'Error');
      }
    });
  }

  loadByGenre(): void {
    this.isLoadingGenre = true;
    this.recommendationsService.getByFavoriteGenre(20).subscribe({
      next: (movies) => {
        console.log('✅ Por género recibidas:', movies);
        this.genreRecommendations = movies;
        this.isLoadingGenre = false;
      },
      error: (error) => {
        console.error('❌ Error loading genre:', error);
        this.isLoadingGenre = false;
        
        if (error.status === 400) {
          this.toastr.info('Califica más películas para identificar tu género favorito', 'Info');
        } else {
          this.toastr.error('Error al cargar recomendaciones por género', 'Error');
        }
      }
    });
  }

  changeTab(tab: 'personalized' | 'trending' | 'genre'): void {
    this.selectedTab = tab;
  }

  getImageUrl(path: string): string {
    return this.movieApi.getImageUrl(path);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#2ecc71';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  }

  getAlgorithmIcon(): string {
    switch (this.algorithm) {
      case 'collaborative':
        return '🤝';
      case 'content_based':
        return '🎬';
      case 'hybrid':
        return '🔮';
      default:
        return '🔥';
    }
  }

  getAlgorithmName(): string {
    switch (this.algorithm) {
      case 'collaborative':
        return 'Filtrado Colaborativo';
      case 'content_based':
        return 'Basado en Contenido';
      case 'hybrid':
        return 'Algoritmo Híbrido';
      default:
        return 'Tendencias Populares';
    }
  }
}