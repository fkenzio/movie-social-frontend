import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { RatingStarsComponent } from '@shared/components/rating-stars/rating-stars';
import { MovieApiService, MovieDetail } from '../../services/movie-api';
import { RatingService, MovieRatingStats } from '../../services/rating';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink, RatingStarsComponent],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class DetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieApi = inject(MovieApiService);
  private ratingService = inject(RatingService);
  private sanitizer = inject(DomSanitizer);
  private toastr = inject(ToastrService);

  movie: MovieDetail | null = null;
  isLoading = true;
  trailerUrl: SafeResourceUrl | null = null;
  showTrailer = false;
  
  // Rating state
  userRating: number = 0;
  movieStats: MovieRatingStats | null = null;
  showRatingModal = false;
  tempRating: number = 0;
  isSavingRating = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const movieId = +params['id'];
      if (movieId) {
        this.loadMovieDetails(movieId);
      }
    });
  }

  loadMovieDetails(movieId: number): void {
    this.isLoading = true;
    this.movieApi.getMovieDetails(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;
        this.loadTrailer();
        this.loadUserRating();
        this.loadMovieStats();
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserRating(): void {
    if (!this.movie) return;
    
    this.ratingService.getUserRating(this.movie.id).subscribe({
      next: (rating) => {
        this.userRating = rating?.rating || 0;
      },
      error: (error) => {
        console.error('Error loading user rating:', error);
      }
    });
  }

  loadMovieStats(): void {
    if (!this.movie) return;
    
    this.ratingService.getMovieStats(this.movie.id, this.movie.vote_average).subscribe({
      next: (stats) => {
        this.movieStats = stats;
      },
      error: (error) => {
        console.error('Error loading movie stats:', error);
      }
    });
  }

  openRatingModal(): void {
    this.tempRating = this.userRating;
    this.showRatingModal = true;
  }

  closeRatingModal(): void {
    this.showRatingModal = false;
    this.tempRating = 0;
  }

  onRatingChange(rating: number): void {
    this.tempRating = rating;
  }

  saveRating(): void {
    if (this.tempRating === 0) {
      this.toastr.warning('Selecciona una calificación', 'Atención');
      return;
    }

    if (!this.movie) return;

    this.isSavingRating = true;
    this.ratingService.createOrUpdateRating(this.movie.id, this.tempRating).subscribe({
      next: () => {
        this.userRating = this.tempRating;
        this.isSavingRating = false;
        this.closeRatingModal();
        this.toastr.success('Calificación guardada', 'Éxito');
        this.loadMovieStats(); // Recargar estadísticas
      },
      error: (error) => {
        this.isSavingRating = false;
        this.toastr.error('Error al guardar calificación', 'Error');
        console.error('Error saving rating:', error);
      }
    });
  }

  deleteRating(): void {
    if (!this.movie || this.userRating === 0) return;

    if (!confirm('¿Estás seguro de eliminar tu calificación?')) return;

    this.ratingService.deleteRating(this.movie.id).subscribe({
      next: () => {
        this.userRating = 0;
        this.toastr.info('Calificación eliminada', 'Eliminada');
        this.loadMovieStats();
      },
      error: (error) => {
        this.toastr.error('Error al eliminar calificación', 'Error');
        console.error('Error deleting rating:', error);
      }
    });
  }

  loadTrailer(): void {
    if (!this.movie?.videos?.results) return;
    
    const trailer = this.movie.videos.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    if (trailer) {
      const url = `https://www.youtube.com/embed/${trailer.key}`;
      this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  toggleTrailer(): void {
    this.showTrailer = !this.showTrailer;
  }

  getImageUrl(path: string): string {
    return this.movieApi.getImageUrl(path);
  }

  getBackdropUrl(path: string): string {
    return this.movieApi.getBackdropUrl(path);
  }

  getRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }

  getRatingColor(rating: number): string {
    if (rating >= 8) return '#2ecc71';
    if (rating >= 6) return '#f39c12';
    return '#e74c3c';
  }

  getCast() {
    return this.movie?.credits?.cast?.slice(0, 10) || [];
  }

  getSimilarMovies() {
    return this.movie?.similar?.results?.slice(0, 6) || [];
  }

  // Convertir TMDB rating (0-10) a escala 1-5
  getTmdbRating(): number {
    if (!this.movie) return 0;
    return this.movie.vote_average / 2;
  }
}