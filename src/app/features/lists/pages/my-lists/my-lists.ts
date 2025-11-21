import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { ListsService, MovieList } from '../../services/lists';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-lists',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink, FormsModule],
  templateUrl: './my-lists.html',
  styleUrls: ['./my-lists.scss']
})
export class MyListsComponent implements OnInit {
  private listsService = inject(ListsService);
  private toastr = inject(ToastrService);

  lists: MovieList[] = [];
  isLoading = true;
  showCreateForm = false;
  newListName = '';
  newListDescription = '';
  isPublic = true;
  isCreating = false;

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading = true;
    this.listsService.getMyLists().subscribe({
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

  createList(): void {
    if (!this.newListName.trim()) {
      this.toastr.warning('Ingresa un nombre para la lista', 'Atención');
      return;
    }

    this.isCreating = true;
    this.listsService.createList(this.newListName, this.newListDescription, this.isPublic).subscribe({
      next: () => {
        this.toastr.success('Lista creada exitosamente', 'Éxito');
        this.resetForm();
        this.loadLists();
      },
      error: () => {
        this.toastr.error('Error al crear la lista', 'Error');
        this.isCreating = false;
      }
    });
  }

  deleteList(list: MovieList, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar la lista "${list.name}"?`)) {
      return;
    }

    this.listsService.deleteList(list.id).subscribe({
      next: () => {
        this.toastr.success('Lista eliminada', 'Eliminada');
        this.loadLists();
      },
      error: () => {
        this.toastr.error('Error al eliminar la lista', 'Error');
      }
    });
  }

  resetForm(): void {
    this.showCreateForm = false;
    this.newListName = '';
    this.newListDescription = '';
    this.isPublic = true;
    this.isCreating = false;
  }
}