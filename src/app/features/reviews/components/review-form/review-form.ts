import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewsService, Review } from '../../services/reviews';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.scss']
})
export class ReviewFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reviewsService = inject(ReviewsService);
  private toastr = inject(ToastrService);

  @Input() movieId!: number;
  @Input() movieTitle!: string;
  @Input() existingReview?: Review;
  @Output() reviewSaved = new EventEmitter<Review>();
  @Output() cancel = new EventEmitter<void>();

  reviewForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.existingReview;
    
    this.reviewForm = this.fb.group({
      title: [this.existingReview?.title || '', [Validators.maxLength(200)]],
      content: [
        this.existingReview?.content || '', 
        [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]
      ],
      contains_spoilers: [this.existingReview?.contains_spoilers || false]
    });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.existingReview) {
      // Actualizar review existente
      this.reviewsService.updateReview(this.existingReview.id, this.reviewForm.value).subscribe({
        next: (review) => {
          this.toastr.success('Reseña actualizada', 'Éxito');
          this.reviewSaved.emit(review);
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      // Crear nueva review
      const reviewData = {
        movie_tmdb_id: this.movieId,
        ...this.reviewForm.value
      };

      this.reviewsService.createReview(reviewData).subscribe({
        next: (review) => {
          this.toastr.success('Reseña publicada', 'Éxito');
          this.reviewSaved.emit(review);
          this.reviewForm.reset();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getCharCount(): number {
    return this.reviewForm.get('content')?.value?.length || 0;
  }

  get title() { return this.reviewForm.get('title'); }
  get content() { return this.reviewForm.get('content'); }
  get contains_spoilers() { return this.reviewForm.get('contains_spoilers'); }
}