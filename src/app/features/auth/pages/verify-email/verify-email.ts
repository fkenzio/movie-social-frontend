import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  verifyForm: FormGroup;
  isLoading = false;
  isResending = false;
  email: string = '';

  constructor() {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Obtener email del localStorage
    this.email = localStorage.getItem('pending_verification_email') || '';
    
    if (!this.email) {
      this.toastr.warning('No hay email pendiente de verificación');
      this.router.navigate(['/auth/register']);
    }
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const verifyData = {
      email: this.email,
      code: this.verifyForm.value.code
    };

    this.authService.verifyEmail(verifyData).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(
          error.error?.message || 'Código inválido',
          'Error'
        );
      }
    });
  }

  resendCode(): void {
    this.isResending = true;

    this.authService.resendVerificationCode({ email: this.email }).subscribe({
      next: () => {
        this.isResending = false;
      },
      error: (error) => {
        this.isResending = false;
        this.toastr.error(
          error.error?.message || 'Error al reenviar código',
          'Error'
        );
      }
    });
  }

  get code() {
    return this.verifyForm.get('code');
  }
}