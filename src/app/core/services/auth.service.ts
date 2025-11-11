import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { environment } from '@env/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  VerifyEmailRequest,
  ResendCodeRequest 
} from '@core/models/auth.model';
import { User } from '@core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  private apiUrl = `${environment.apiUrl}/auth`;
  
  // BehaviorSubject para el usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // BehaviorSubject para el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.checkAuthStatus();
  }

  // Verificar si hay un usuario en localStorage al iniciar
  private checkAuthStatus(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  // ==================== LOGIN ====================
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        this.toastr.success('Bienvenido de nuevo!', 'Login exitoso');
        this.router.navigate(['/feed']);
      })
    );
  }

  // ==================== REGISTER ====================
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        this.toastr.success(
          'Revisa tu correo para verificar tu cuenta', 
          'Registro exitoso'
        );
        // No guardamos el token hasta que verifique el email
        localStorage.setItem('pending_verification_email', userData.email);
        this.router.navigate(['/auth/verify-email']);
      })
    );
  }

  // ==================== VERIFY EMAIL ====================
  verifyEmail(data: VerifyEmailRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, data).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        localStorage.removeItem('pending_verification_email');
        this.toastr.success('Cuenta verificada correctamente', 'Verificación exitosa');
        this.router.navigate(['/feed']);
      })
    );
  }

  // ==================== RESEND VERIFICATION CODE ====================
  resendVerificationCode(data: ResendCodeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-code`, data).pipe(
      tap(() => {
        this.toastr.success('Código reenviado a tu correo', 'Código enviado');
      })
    );
  }

  // ==================== LOGOUT ====================
  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    
    // Limpiar subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.toastr.info('Sesión cerrada', 'Hasta pronto');
    this.router.navigate(['/auth/login']);
  }

  // ==================== HELPERS ====================
  
  private handleAuthSuccess(response: AuthResponse): void {
    // Guardar token
    localStorage.setItem('access_token', response.access_token);
    
    // Guardar usuario
    localStorage.setItem('current_user', JSON.stringify(response.user));
    
    // Actualizar subjects
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Obtener usuario actual del localStorage
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('current_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Obtener usuario actual (valor inmediato)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Actualizar datos del usuario actual
  updateCurrentUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}