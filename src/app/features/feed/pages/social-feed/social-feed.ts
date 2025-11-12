import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@shared/components/navbar/navbar';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './social-feed.html',
  styleUrls: ['./social-feed.scss']
})
export class SocialFeedComponent implements OnInit {
  private authService = inject(AuthService);
  
  currentUser: User | null = null;
  
  // Posts de ejemplo (temporal)
  posts = [
    {
      id: 1,
      user: { username: 'cinefilo123', avatar: 'C' },
      type: 'review',
      movie: 'Inception',
      content: '¡Increíble película! Christopher Nolan nunca decepciona. La trama es compleja pero brillante.',
      rating: 9.5,
      likes: 24,
      comments: 8,
      time: 'Hace 2 horas'
    },
    {
      id: 2,
      user: { username: 'moviefan', avatar: 'M' },
      type: 'rating',
      movie: 'The Shawshank Redemption',
      rating: 10,
      likes: 45,
      comments: 12,
      time: 'Hace 5 horas'
    },
    {
      id: 3,
      user: { username: 'filmcritic', avatar: 'F' },
      type: 'list',
      content: 'Creó la lista "Mejores thrillers psicológicos"',
      movies: ['Shutter Island', 'Gone Girl', 'The Prestige'],
      likes: 18,
      comments: 5,
      time: 'Hace 1 día'
    }
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}
