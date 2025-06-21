import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, Teacher } from '../../core/api.service';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="header-section">
        <h1>Teacher Profile</h1>
        <p class="welcome-text">Manage your profile information and account settings</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>Error loading profile: {{ error }}</p>
        <button class="retry-btn" (click)="loadProfile()">Retry</button>
      </div>

      <!-- Profile Content -->
      <div class="profile-content" *ngIf="teacher && !loading">
        <div class="profile-grid">
          <!-- Profile Information -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Profile Information</h2>
              <button class="edit-btn" (click)="toggleEdit()" *ngIf="!isEditing">
                ✏️ Edit Profile
              </button>
              <div class="edit-actions" *ngIf="isEditing">
                <button class="btn-secondary" (click)="cancelEdit()">Cancel</button>
                <button class="btn-primary" (click)="saveProfile()" [disabled]="saving">
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>

            <form [formGroup]="profileForm" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Full Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    formControlName="name"
                    [readonly]="!isEditing"
                    class="form-input"
                    [class.readonly]="!isEditing"
                    [class.error]="isFieldInvalid('name')"
                  >
                  <div class="error-message" *ngIf="isFieldInvalid('name')">
                    {{ getFieldError('name') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    formControlName="email"
                    [readonly]="!isEditing"
                    class="form-input"
                    [class.readonly]="!isEditing"
                    [class.error]="isFieldInvalid('email')"
                  >
                  <div class="error-message" *ngIf="isFieldInvalid('email')">
                    {{ getFieldError('email') }}
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="subject">Primary Subject</label>
                  <select 
                    id="subject"
                    formControlName="subject"
                    [disabled]="!isEditing"
                    class="form-select"
                    [class.readonly]="!isEditing"
                  >
                    <option value="">Select a subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Literature">Literature</option>
                    <option value="Geography">Geography</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="role">Role</label>
                  <input 
                    type="text" 
                    id="role"
                    formControlName="role"
                    readonly
                    class="form-input readonly"
                  >
                </div>
              </div>

              <div class="form-group full-width" *ngIf="isEditing">
                <label for="bio">Bio</label>
                <textarea 
                  id="bio"
                  formControlName="bio"
                  rows="4"
                  placeholder="Tell us about yourself, your teaching experience, and expertise..."
                  class="form-textarea"
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Account Statistics -->
          <div class="stats-section">
            <h2>Account Statistics</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                  <h3>{{ stats.totalAssignments }}</h3>
                  <p>Total Assignments</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <h3>{{ stats.totalStudents }}</h3>
                  <p>Students Taught</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                  <h3>{{ stats.totalSubmissions }}</h3>
                  <p>Submissions Graded</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                  <h3>{{ stats.averageGrade }}%</h3>
                  <p>Average Grade</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Settings -->
        <div class="settings-section">
          <h2>Account Settings</h2>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-info">
                <h3>Change Password</h3>
                <p>Update your account password for enhanced security</p>
              </div>
              <button class="btn-secondary" (click)="showChangePassword = true">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div class="modal-overlay" *ngIf="showChangePassword" (click)="showChangePassword = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Change Password</h3>
            <button class="close-btn" (click)="showChangePassword = false">✕</button>
          </div>
          <div class="modal-body">
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input 
                  type="password" 
                  id="currentPassword"
                  formControlName="currentPassword"
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword"
                  formControlName="newPassword"
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  class="form-input"
                >
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="showChangePassword = false">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" [disabled]="passwordForm.invalid">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .header-section h1 {
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
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .profile-section, .stats-section, .settings-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .edit-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .edit-actions {
      display: flex;
      gap: 0.5rem;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .form-input, .form-select, .form-textarea {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .form-input.readonly, .form-select.readonly {
      background: #f8f9fa;
      color: #7f8c8d;
      cursor: not-allowed;
    }

    .form-input.error {
      border-color: #e74c3c;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-primary:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn-secondary:hover {
      background: #bdc3c7;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .stat-content h3 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0 0 0.25rem 0;
    }

    .stat-content p {
      color: #7f8c8d;
      margin: 0;
      font-size: 0.9rem;
    }

    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .setting-info h3 {
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
    }

    .setting-info p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 0 1.5rem;
      border-bottom: 1px solid #ecf0f1;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #7f8c8d;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: #ecf0f1;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body .form-group {
      margin-bottom: 1rem;
    }

    .modal-body .form-group:last-child {
      margin-bottom: 0;
    }

    .modal-body .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .modal-body .form-input {
      width: 100%;
      box-sizing: border-box;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #ecf0f1;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 2rem;
    }

    .spinner {
      border: 4px solid #ecf0f1;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .retry-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  teacher: Teacher | null = null;
  loading = true;
  error: string | null = null;
  saving = false;
  isEditing = false;
  showChangePassword = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  stats = {
    totalAssignments: 0,
    totalStudents: 0,
    totalSubmissions: 0,
    averageGrade: 0
  };

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: [''],
      role: ['teacher'],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getTeacherProfile().subscribe({
      next: (data) => {
        this.teacher = data;
        
        // Populate the form with teacher data
        this.profileForm.patchValue({
          name: data.name || '',
          email: data.email || '',
          subject: data.subject || '',
          role: data.role || 'teacher',
          bio: data.bio || ''
        });
        
        this.loading = false;
        
        // Load statistics after profile is loaded
        this.loadStats();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    // Load real statistics from the dashboard API
    this.apiService.getTeacherDashboard().subscribe({
      next: (data) => {
        // Get total submissions from all assignments
        this.apiService.getTeacherAssignments().subscribe({
          next: (assignments) => {
            const totalSubmissions = assignments.reduce((total, assignment) => {
              return total + (assignment.assignmentSubmitted?.length || 0);
            }, 0);
            
            this.stats = {
              totalAssignments: data.totalAssignments || 0,
              totalStudents: data.totalStudents || 0,
              totalSubmissions: totalSubmissions,
              averageGrade: this.calculateAverageGrade(data.recentSubmissions || [])
            };
          },
          error: (err) => {
            this.stats = {
              totalAssignments: data.totalAssignments || 0,
              totalStudents: data.totalStudents || 0,
              totalSubmissions: data.recentSubmissions?.length || 0,
              averageGrade: this.calculateAverageGrade(data.recentSubmissions || [])
            };
          }
        });
      },
      error: (err) => {
        // Keep default values if stats fail to load
      }
    });
  }

  calculateAverageGrade(submissions: any[]): number {
    if (submissions.length === 0) return 0;
    
    const gradedSubmissions = submissions.filter(sub => sub.grade !== undefined);
    if (gradedSubmissions.length === 0) return 0;
    
    const totalGrade = gradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0);
    return Math.round(totalGrade / gradedSubmissions.length);
  }

  toggleEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.teacher?.name,
      email: this.teacher?.email,
      subject: this.teacher?.subject || '',
      role: this.teacher?.role
    });
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.saving = true;

      const profileData = this.profileForm.value;
      this.apiService.updateTeacherProfile(profileData).subscribe({
        next: (data) => {
          this.teacher = data;
          this.isEditing = false;
          this.saving = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to update profile';
          this.saving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      // Mock password change - this would call the API
      this.showChangePassword = false;
      this.passwordForm.reset();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }
}
