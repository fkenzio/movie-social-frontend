import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListsService, ListCheckResult } from '@features/lists/services/lists';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-to-list-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-to-list-modal.html',
  styleUrls: ['./add-to-list-modal.scss']
})
export class AddToListModalComponent implements OnInit {
  private listsService = inject(ListsService);
  private toastr = inject(ToastrService);

  @Input() movieId!: number;
  @Input() movieTitle!: string;
  @Output() close = new EventEmitter<void>();

  lists: ListCheckResult[] = [];
  isLoading = true;
  showCreateForm = false;
  newListName = '';
  isCreating = false;

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading = true;
    this.listsService.checkMovieInLists(this.movieId).subscribe({
      next: (lists) => {
        this.lists = lists;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading lists:', error);
        this.isLoading = false;
      }
    });
  }

  toggleMovie(list: ListCheckResult): void {
    if (list.in_list) {
      // Quitar de la lista
      this.listsService.removeMovieFromList(list.list_id, this.movieId).subscribe({
        next: () => {
          list.in_list = false;
          this.toastr.success('Película eliminada de la lista', 'Eliminada');
        },
        error: () => {
          this.toastr.error('Error al eliminar', 'Error');
        }
      });
    } else {
      // Agregar a la lista
      this.listsService.addMovieToList(list.list_id, this.movieId).subscribe({
        next: () => {
          list.in_list = true;
          this.toastr.success('Película agregada a la lista', 'Agregada');
        },
        error: () => {
          this.toastr.error('Error al agregar', 'Error');
        }
      });
    }
  }

  createNewList(): void {
    if (!this.newListName.trim()) {
      this.toastr.warning('Ingresa un nombre para la lista', 'Atención');
      return;
    }

    this.isCreating = true;
    this.listsService.createList(this.newListName).subscribe({
      next: (newList) => {
        this.toastr.success('Lista creada', 'Éxito');
        this.showCreateForm = false;
        this.newListName = '';
        this.isCreating = false;
        this.loadLists();
      },
      error: () => {
        this.toastr.error('Error al crear lista', 'Error');
        this.isCreating = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}