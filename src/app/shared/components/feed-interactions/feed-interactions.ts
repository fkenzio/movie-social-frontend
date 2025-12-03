import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InteractionService, InteractionStats, Comment } from '@core/services/interaction.service';
import { AuthService } from '@core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-feed-interactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed-interactions.html',
  styleUrls: ['./feed-interactions.scss']
})
export class FeedInteractionsComponent implements OnInit {
  private interactionService = inject(InteractionService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  @Input() targetType!: string; // 'rating', 'review', 'list'
  @Input() targetId!: number;
  @Input() movieTitle?: string; // Para contexto
  
  stats: InteractionStats | null = null;
  comments: Comment[] = [];
  
  showComments = false;
  showCommentForm = false;
  newCommentContent = '';
  isSubmitting = false;
  isLoadingComments = false;
  
  // Para respuestas
  replyToCommentId: number | null = null;
  replyContent = '';
  expandedComments = new Set<number>(); // IDs de comentarios con respuestas expandidas

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.interactionService.getStats(this.targetType, this.targetId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  // ==================== LIKES ====================
  
  toggleLike(): void {
    this.interactionService.toggleLike(this.targetType, this.targetId).subscribe({
      next: (result) => {
        if (this.stats) {
          this.stats.user_has_liked = result.liked;
          this.stats.likes_count += result.liked ? 1 : -1;
        }
      },
      error: () => {
        this.toastr.error('Error al dar like', 'Error');
      }
    });
  }

  // ==================== COMMENTS ====================
  
  toggleComments(): void {
    this.showComments = !this.showComments;
    
    if (this.showComments && this.comments.length === 0) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.isLoadingComments = true;
    this.interactionService.getComments(this.targetType, this.targetId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoadingComments = false;
      },
      error: () => {
        this.isLoadingComments = false;
        this.toastr.error('Error al cargar comentarios', 'Error');
      }
    });
  }

  toggleCommentForm(): void {
    this.showCommentForm = !this.showCommentForm;
    if (!this.showCommentForm) {
      this.newCommentContent = '';
    }
  }

  submitComment(): void {
    if (!this.newCommentContent.trim()) {
      this.toastr.warning('Escribe un comentario', 'Atención');
      return;
    }

    this.isSubmitting = true;
    this.interactionService.createComment(
      this.targetType,
      this.targetId,
      this.newCommentContent
    ).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newCommentContent = '';
        this.showCommentForm = false;
        this.isSubmitting = false;
        
        if (this.stats) {
          this.stats.comments_count++;
          this.stats.user_has_commented = true;
        }
        
        this.toastr.success('Comentario publicado', 'Éxito');
      },
      error: () => {
        this.isSubmitting = false;
        this.toastr.error('Error al publicar comentario', 'Error');
      }
    });
  }

  // ==================== REPLIES ====================
  
  startReply(commentId: number): void {
    this.replyToCommentId = commentId;
    this.replyContent = '';
  }

  cancelReply(): void {
    this.replyToCommentId = null;
    this.replyContent = '';
  }

  submitReply(parentComment: Comment): void {
    if (!this.replyContent.trim()) {
      this.toastr.warning('Escribe una respuesta', 'Atención');
      return;
    }

    this.isSubmitting = true;
    this.interactionService.createComment(
      this.targetType,
      this.targetId,
      this.replyContent,
      parentComment.id
    ).subscribe({
      next: (reply) => {
        parentComment.replies_count++;
        
        // Si las respuestas están expandidas, cargarlas
        if (this.expandedComments.has(parentComment.id)) {
          this.loadReplies(parentComment);
        }
        
        this.cancelReply();
        this.isSubmitting = false;
        this.toastr.success('Respuesta publicada', 'Éxito');
        
        if (this.stats) {
          this.stats.comments_count++;
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.toastr.error('Error al publicar respuesta', 'Error');
      }
    });
  }

  toggleReplies(comment: Comment): void {
    if (this.expandedComments.has(comment.id)) {
      this.expandedComments.delete(comment.id);
    } else {
      this.expandedComments.add(comment.id);
      this.loadReplies(comment);
    }
  }

  loadReplies(comment: Comment): void {
    this.interactionService.getCommentReplies(comment.id).subscribe({
      next: (replies) => {
        (comment as any).replies = replies;
      },
      error: () => {
        this.toastr.error('Error al cargar respuestas', 'Error');
      }
    });
  }

  // ==================== COMMENT ACTIONS ====================
  
  toggleCommentLike(comment: Comment): void {
    this.interactionService.toggleLike('comment', comment.id).subscribe({
      next: (result) => {
        comment.user_has_liked = result.liked;
        comment.likes_count += result.liked ? 1 : -1;
      },
      error: () => {
        this.toastr.error('Error al dar like', 'Error');
      }
    });
  }

  deleteComment(comment: Comment): void {
    if (!confirm('¿Eliminar este comentario?')) return;

    this.interactionService.deleteComment(comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        if (this.stats) {
          this.stats.comments_count--;
        }
        this.toastr.success('Comentario eliminado', 'Eliminado');
      },
      error: () => {
        this.toastr.error('Error al eliminar comentario', 'Error');
      }
    });
  }

  isCommentOwner(comment: Comment): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === comment.user_id;
  }

  // ==================== SHARE ====================
  
  sharePost(): void {
    const url = this.interactionService.generateShareUrl(this.targetType, this.targetId);
    
    this.interactionService.copyToClipboard(url).then(() => {
      this.toastr.success('Link copiado al portapapeles', 'Copiado');
    }).catch(() => {
      this.toastr.error('Error al copiar link', 'Error');
    });
  }

  // ==================== HELPERS ====================
  
  getTimeAgo(dateString: string): string {
    const now = new Date();
    const created = new Date(dateString);
    const diff = now.getTime() - created.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return created.toLocaleDateString();
  }

  getUserInitial(username: string): string {
    return username?.charAt(0)?.toUpperCase() || 'U';
  }

  getReplies(comment: Comment): Comment[] {
    return (comment as any).replies || [];
  }
}