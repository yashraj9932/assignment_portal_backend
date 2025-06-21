import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();

  showSuccess(message: string, duration: number = 3000): void {
    this.showNotification({ type: 'success', message, duration });
  }

  showError(message: string, duration: number = 5000): void {
    this.showNotification({ type: 'error', message, duration });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.showNotification({ type: 'warning', message, duration });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.showNotification({ type: 'info', message, duration });
  }

  private showNotification(notification: Notification): void {
    this.notificationSubject.next(notification);
  }

  // Helper method for API error handling
  handleApiError(error: any, defaultMessage: string = 'An error occurred'): string {
    let errorMessage = defaultMessage;
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid request. Please check your input.';
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'You are not authorized to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    return errorMessage;
  }
}
