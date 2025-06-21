import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  success: boolean;
  token: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string, role: 'student' | 'teacher'): Observable<LoginResponse> {
    const endpoint = role === 'student' ? '/student/login' : '/teacher/login';
    return this.http.post<LoginResponse>(`${this.apiUrl}${endpoint}`, { email, password }).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', role);
          // Optionally store user info if returned
          if (res['user']) {
            localStorage.setItem('user', JSON.stringify(res['user']));
          }
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  register(name: string, email: string, password: string, role: 'student' | 'teacher'): Observable<any> {
    const endpoint = role === 'student' ? '/student' : '/teacher';
    return this.http.post<any>(`${this.apiUrl}${endpoint}`, { name, email, password });
  }
}
