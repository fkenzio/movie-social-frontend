import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { MovieApiService, MovieDetail } from '../../services/movie-api';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class DetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieApi = inject(MovieApiService);
  private sanitizer = inject(DomSanitizer);

  movie: MovieDetail | null = null;
  isLoading = true;
  trailerUrl: SafeResourceUrl | null = null;
  showTrailer = false;

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
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.isLoading = false;
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
}