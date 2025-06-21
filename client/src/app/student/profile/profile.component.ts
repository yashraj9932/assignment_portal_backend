import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ApiService, Student } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>My Profile</h1>
        <p class="welcome-text">Manage your account information and preferences</p>
      </div>

      <div class="profile-content">
        <!-- Profile Form Section -->
        <div class="profile-form-section">
          <div class="section-header">
            <h2>👤 Personal Information</h2>
            <p>Update your personal details and account settings</p>
          </div>

          <div class="form-card">
            <div *ngIf="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading profile...</p>
            </div>

            <form *ngIf="!loading" [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Full Name</label>
                  <input 
                    id="name"
                    type="text" 
                    formControlName="name" 
                    placeholder="Enter your full name"
                    class="form-input"
                    [class.error]="isFieldInvalid('name')"
                  >
                  <div *ngIf="isFieldInvalid('name')" class="error-message">
                    {{ getFieldError('name') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input 
                    id="email"
                    type="email" 
                    formControlName="email" 
                    placeholder="Enter your email"
                    class="form-input"
                    [class.error]="isFieldInvalid('email')"
                  >
                  <div *ngIf="isFieldInvalid('email')" class="error-message">
                    {{ getFieldError('email') }}
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="currentPassword">Current Password</label>
                  <input 
                    id="currentPassword"
                    type="password" 
                    formControlName="currentPassword" 
                    placeholder="Enter current password (required only for password changes)"
                    class="form-input"
                    [class.error]="isFieldInvalid('currentPassword')"
                  >
                  <div *ngIf="isFieldInvalid('currentPassword')" class="error-message">
                    {{ getFieldError('currentPassword') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="newPassword">New Password</label>
                  <input 
                    id="newPassword"
                    type="password" 
                    formControlName="newPassword" 
                    placeholder="Enter new password (optional)"
                    class="form-input"
                    [class.error]="isFieldInvalid('newPassword')"
                  >
                  <div *ngIf="isFieldInvalid('newPassword')" class="error-message">
                    {{ getFieldError('newPassword') }}
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="confirmPassword">Confirm New Password</label>
                  <input 
                    id="confirmPassword"
                    type="password" 
                    formControlName="confirmPassword" 
                    placeholder="Confirm new password"
                    class="form-input"
                    [class.error]="isFieldInvalid('confirmPassword')"
                  >
                  <div *ngIf="isFieldInvalid('confirmPassword')" class="error-message">
                    {{ getFieldError('confirmPassword') }}
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn primary"
                  [disabled]="profileForm.invalid || updating"
                >
                  <span *ngIf="updating" class="spinner-small"></span>
                  {{ updating ? 'Updating...' : '💾 Update Profile' }}
                </button>
                
                <button 
                  type="button" 
                  class="btn secondary"
                  (click)="resetForm()" 
                  [disabled]="updating"
                >
                  🔄 Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Account Information Section -->
        <div class="account-info-section">
          <div class="section-header">
            <h2>ℹ️ Account Information</h2>
            <p>Your account details and statistics</p>
          </div>

          <div class="info-card">
            <div class="info-item">
              <div class="info-label">
                <span class="info-icon">🆔</span>
                Student ID
              </div>
              <div class="info-value">{{ student?._id || 'Loading...' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <span class="info-icon">👤</span>
                Role
              </div>
              <div class="info-value">{{ student?.role || 'Student' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <span class="info-icon">📅</span>
                Member Since
              </div>
              <div class="info-value">
                {{ student?.createdAt ? (student?.createdAt | date:'mediumDate') : 'Loading...' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <span class="info-icon">📚</span>
                Total Assignments
              </div>
              <div class="info-value">{{ student?.assignmentsLeft?.length || 0 }}</div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="stats-card">
            <h3>📊 Quick Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ getCompletedAssignments() }}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ getPendingAssignments() }}</div>
                <div class="stat-label">Pending</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ getOverdueAssignments() }}</div>
                <div class="stat-label">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="message" class="message-banner" [class]="messageType">
        <span class="message-icon">
          {{ messageType === 'success' ? '✅' : '❌' }}
        </span>
        {{ message }}
        <button class="close-btn" (click)="clearMessage()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .profile-header h1 {
      color: #2c3e50;
      margin-bottom: 0.25rem;
      font-size: 1.8rem;
    }

    .welcome-text {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin: 0;
    }

    .profile-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .section-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .form-card, .info-card, .stats-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #7f8c8d;
    }

    .spinner {
      border: 4px solid #ecf0f1;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .spinner-small {
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      color: #2c3e50;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .form-input {
      padding: 0.75rem;
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-input.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn.primary {
      background: #3498db;
      color: white;
    }

    .btn.primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn.secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn.secondary:hover:not(:disabled) {
      background: #bdc3c7;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #ecf0f1;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #7f8c8d;
      font-weight: 500;
    }

    .info-icon {
      font-size: 1.2rem;
    }

    .info-value {
      color: #2c3e50;
      font-weight: 500;
    }

    .stats-card h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .message-banner {
      position: fixed;
      top: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 1000;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    }

    .message-banner.success {
      background: #27ae60;
    }

    .message-banner.error {
      background: #e74c3c;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: auto;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .message-banner {
        right: 1rem;
        left: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  student: Student | null = null;
  loading = true;
  updating = false;
  profileForm: FormGroup;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: [this.passwordMatchValidator, this.passwordChangeValidator] });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.apiService.getStudentProfile().subscribe({
      next: (data) => {
        this.student = data;
        this.profileForm.patchValue({
          name: data.name || '',
          email: data.email || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Failed to load profile: ' + err.message, 'error');
        this.loading = false;
      }
    });
  }

  passwordMatchValidator(form: AbstractControl) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  passwordChangeValidator(form: AbstractControl) {
    const newPassword = form.get('newPassword')?.value;
    const currentPassword = form.get('currentPassword')?.value;
    
    if (newPassword && !currentPassword) {
      return { currentPasswordRequired: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.updating = true;
    const formData = this.profileForm.value;

    // Prepare update data
    const updateData: any = {
      name: formData.name,
      email: formData.email
    };

    // Only include password fields if new password is provided
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    this.apiService.updateStudentProfile(updateData).subscribe({
      next: (data) => {
        this.student = data;
        this.showMessage('Profile updated successfully!', 'success');
        this.updating = false;
        
        // Clear password fields
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      },
      error: (err) => {
        this.showMessage('Failed to update profile: ' + err.message, 'error');
        this.updating = false;
      }
    });
  }

  resetForm(): void {
    if (this.student) {
      this.profileForm.patchValue({
        name: this.student.name || '',
        email: this.student.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['minlength']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    if (field.errors['passwordMismatch']) return 'Passwords do not match';
    if (field.errors['currentPasswordRequired']) return 'Current password is required when changing password';

    return 'Invalid input';
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage(): void {
    this.message = '';
  }

  getCompletedAssignments(): number {
    // This would typically come from the API
    return 0;
  }

  getPendingAssignments(): number {
    // This would typically come from the API
    return this.student?.assignmentsLeft?.length || 0;
  }

  getOverdueAssignments(): number {
    // This would typically come from the API
    return 0;
  }
}
