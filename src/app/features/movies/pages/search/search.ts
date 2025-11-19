import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { MovieApiService, Movie } from '../../services/movie-api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class SearchComponent implements OnInit {
  private movieApi = inject(MovieApiService);

  searchControl = new FormControl('');
  movies: Movie[] = [];
  isLoading = false;
  noResults = false;

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.movies = [];
          this.noResults = false;
          return [];
        }
        
        this.isLoading = true;
        return this.movieApi.searchMovies(query);
      })
    ).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.noResults = response.results.length === 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getImageUrl(path: string): string {
    return this.movieApi.getImageUrl(path);
  }
}