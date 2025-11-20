import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-stars.html',
  styleUrls: ['./rating-stars.scss']
})
export class RatingStarsComponent {
  @Input() rating: number = 0;
  @Input() readonly: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() ratingChange = new EventEmitter<number>();

  hoveredRating: number = 0;

  getStars(): { full: boolean; half: boolean; empty: boolean }[] {
    const stars = [];
    const displayRating = this.hoveredRating || this.rating;
    
    for (let i = 1; i <= 5; i++) {
      if (displayRating >= i) {
        stars.push({ full: true, half: false, empty: false });
      } else if (displayRating >= i - 0.5) {
        stars.push({ full: false, half: true, empty: false });
      } else {
        stars.push({ full: false, half: false, empty: true });
      }
    }
    
    return stars;
  }

  onStarClick(index: number, isHalf: boolean): void {
    if (this.readonly) return;
    
    const newRating = isHalf ? index + 0.5 : index + 1;
    this.rating = newRating;
    this.ratingChange.emit(newRating);
  }

  onStarHover(index: number, isHalf: boolean): void {
    if (this.readonly) return;
    this.hoveredRating = isHalf ? index + 0.5 : index + 1;
  }

  onMouseLeave(): void {
    this.hoveredRating = 0;
  }
}