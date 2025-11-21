import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { ListsService, ListDetail, MovieInList } from '../../services/lists';
import { MovieApiService, MovieDetail } from '@features/movies/services/movie-api';
import { ToastrService } from 'ngx-toastr';

interface MovieWithDetails extends MovieInList {
  details?: any;
  loading?: boolean;
}

@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink, FormsModule],
  templateUrl: './list-detail.html',
  styleUrls: ['./list-detail.scss']
})
export class ListDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listsService = inject(ListsService);
  private movieApi = inject(MovieApiService);
  private toastr = inject(ToastrService);

  list: ListDetail | null = null;
  movies: MovieWithDetails[] = [];
  isLoading = true;
  isEditMode = false;
  editName = '';
  editDescription = '';
  isSaving = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const listId = +params['id'];
      if (listId) {
        this.loadListDetail(listId);
      }
    });
  }

  loadListDetail(listId: number): void {
    this.isLoading = true;
    this.listsService.getListDetail(listId).subscribe({
      next: (list) => {
        this.list = list;
        this.editName = list.name;
        this.editDescription = list.description || '';
        this.loadMoviesDetails(list.movies);
      },
      error: (error) => {
        console.error('Error loading list:', error);
        this.toastr.error('Error al cargar la lista', 'Error');
        this.router.navigate(['/lists']);
      }
    });
  }

  loadMoviesDetails(movies: MovieInList[]): void {
    if (movies.length === 0) {
      this.movies = [];
      this.isLoading = false;
      return;
    }

    // Cargar detalles de todas las películas
    const movieRequests = movies.map(movie => 
      this.movieApi.getMovieDetails(movie.movie_tmdb_id)
    );

    forkJoin(movieRequests).subscribe({
      next: (movieDetails) => {
        this.movies = movies.map((movie, index) => ({
          ...movie,
          details: movieDetails[index]
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.movies = movies;
        this.isLoading = false;
      }
    });
  }

  removeMovie(movie: MovieWithDetails, event: Event): void {
    event.stopPropagation();
    
    if (!this.list) return;

    if (!confirm(`¿Eliminar "${movie.details?.title || 'esta película'}" de la lista?`)) {
      return;
    }

    this.listsService.removeMovieFromList(this.list.id, movie.movie_tmdb_id).subscribe({
      next: () => {
        this.movies = this.movies.filter(m => m.movie_tmdb_id !== movie.movie_tmdb_id);
        if (this.list) {
          this.list.movies_count--;
        }
        this.toastr.success('Película eliminada de la lista', 'Eliminada');
      },
      error: () => {
        this.toastr.error('Error al eliminar película', 'Error');
      }
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Cancelar edición
      this.isEditMode = false;
      this.editName = this.list?.name || '';
      this.editDescription = this.list?.description || '';
    } else {
      // Activar edición
      this.isEditMode = true;
    }
  }

  saveChanges(): void {
    if (!this.list || !this.editName.trim()) {
      this.toastr.warning('El nombre de la lista es requerido', 'Atención');
      return;
    }

    this.isSaving = true;
    this.listsService.updateList(this.list.id, {
      name: this.editName,
      description: this.editDescription
    }).subscribe({
      next: () => {
        if (this.list) {
          this.list.name = this.editName;
          this.list.description = this.editDescription;
        }
        this.isEditMode = false;
        this.isSaving = false;
        this.toastr.success('Lista actualizada', 'Éxito');
      },
      error: () => {
        this.isSaving = false;
        this.toastr.error('Error al actualizar la lista', 'Error');
      }
    });
  }

  deleteList(): void {
    if (!this.list) return;

    if (!confirm(`¿Estás seguro de eliminar la lista "${this.list.name}"?`)) {
      return;
    }

    this.listsService.deleteList(this.list.id).subscribe({
      next: () => {
        this.toastr.success('Lista eliminada', 'Eliminada');
        this.router.navigate(['/lists']);
      },
      error: () => {
        this.toastr.error('Error al eliminar la lista', 'Error');
      }
    });
  }

  getImageUrl(path: string): string {
    return this.movieApi.getImageUrl(path);
  }

  goBack(): void {
    this.router.navigate(['/lists']);
  }
}