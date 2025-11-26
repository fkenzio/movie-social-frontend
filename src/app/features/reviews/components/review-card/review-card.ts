import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review, ReviewsService } from '../../services/reviews';
import { AuthService } from '@core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-card.html',
  styleUrls: ['./review-card.scss']
})
export class ReviewCardComponent {
  private authService = inject(AuthService);
  private reviewsService = inject(ReviewsService);
  private toastr = inject(ToastrService);

  @Input() review!: Review;
  @Input() showMovieInfo = false;
  @Output() reviewDeleted = new EventEmitter<number>();
  @Output() reviewEdit = new EventEmitter<Review>();

  showSpoiler = false;
  showFullContent = false;
  isDeleting = false;

  get isOwner(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === this.review.user_id;
  }

  get contentPreview(): string {
    if (this.showFullContent) return this.review.content;
    return this.review.content.length > 300 
      ? this.review.content.substring(0, 300) + '...'
      : this.review.content;
  }

  get needsReadMore(): boolean {
    return this.review.content.length > 300;
  }

  toggleSpoiler(): void {
    this.showSpoiler = !this.showSpoiler;
  }

  toggleFullContent(): void {
    this.showFullContent = !this.showFullContent;
  }

  onEdit(): void {
    this.reviewEdit.emit(this.review);
  }

  onDelete(): void {
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) {
      return;
    }

    this.isDeleting = true;
    this.reviewsService.deleteReview(this.review.id).subscribe({
      next: () => {
        this.toastr.success('Reseña eliminada', 'Eliminada');
        this.reviewDeleted.emit(this.review.id);
        this.isDeleting = false;
      },
      error: () => {
        this.isDeleting = false;
      }
    });
  }

  getTimeAgo(): string {
    const now = new Date();
    const created = new Date(this.review.created_at);
    const diff = now.getTime() - created.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return created.toLocaleDateString();
  }
}