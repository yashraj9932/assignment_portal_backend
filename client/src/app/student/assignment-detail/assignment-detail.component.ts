import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Assignment } from '../../core/api.service';

@Component({
  selector: 'app-student-assignment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="assignment-detail-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading assignment details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-state">
        <p>Error loading assignment: {{ error }}</p>
        <button class="retry-btn" (click)="loadAssignment()">Retry</button>
      </div>

      <!-- Assignment Content -->
      <div *ngIf="!loading && !error && assignment" class="assignment-content">
        <!-- Header Section -->
        <div class="assignment-header">
          <div class="header-info">
            <h1>{{ assignment.title }}</h1>
            <div class="meta-tags">
              <span class="subject-tag">{{ assignment.subject }}</span>
              <span class="teacher-tag">👨‍🏫 {{ assignment.teacher }}</span>
              <span class="due-date-tag" [class.overdue]="isOverdue()">
                📅 Due: {{ assignment.dueDate | date:'mediumDate' }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn secondary" (click)="goBack()">← Back to List</button>
          </div>
        </div>

        <!-- Assignment Description & Status -->
        <div class="description-section">
          <div class="description-header">
            <h2>Assignment Description</h2>
            <div *ngIf="assignment.isSubmitted" class="submission-badge">
              <span class="status-icon">✅</span>
              <span class="status-text">Submitted</span>
            </div>
          </div>
          <div class="description-content">
            <p>{{ assignment.description }}</p>
            <div *ngIf="assignment.isSubmitted" class="submission-info-inline">
              <span class="submission-date">Submitted on: {{ assignment.submittedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <!-- Submission Details -->
        <div *ngIf="assignment.isSubmitted" class="submission-details">
          <h2>Your Submission</h2>
          <div class="submission-info">
            <div class="submission-file">
              <div class="file-info">
                <div class="file-icon">📄</div>
                <div class="file-details">
                  <h4>Submitted File</h4>
                  <p class="file-name">{{ getSubmittedFileName() }}</p>
                  <span class="submission-time">Submitted: {{ assignment.submittedAt | date:'medium' }}</span>
                </div>
              </div>
              <div class="file-actions">
                <button class="btn secondary" (click)="downloadSubmission()">
                  📥 Download
                </button>
              </div>
            </div>
            
            <div class="submission-meta">
              <div class="meta-item">
                <span class="meta-label">Submission Status:</span>
                <span class="meta-value status-completed">✅ Completed</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Submitted:</span>
                <span class="meta-value">{{ assignment.submittedAt | date:'medium' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Due Date:</span>
                <span class="meta-value" [class.overdue]="isOverdue()">
                  {{ assignment.dueDate | date:'medium' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Submission Form -->
        <div *ngIf="!assignment.isSubmitted" class="submission-section">
          <h2>Submit Your Assignment</h2>
          
          <form [formGroup]="submissionForm" (ngSubmit)="onSubmit()" class="submission-form">
            <div class="file-upload-section">
              <label for="assignmentFile" class="file-label">
                <div class="file-upload-area" [class.has-file]="selectedFile">
                  <div class="upload-icon">📁</div>
                  <div class="upload-text">
                    <span *ngIf="!selectedFile">Click to upload your assignment file</span>
                    <span *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</span>
                  </div>
                  <div class="upload-hint">
                    Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG
                  </div>
                </div>
              </label>
              
              <input 
                type="file" 
                id="assignmentFile"
                formControlName="assignmentFile"
                (change)="onFileSelected($event)"
                class="file-input"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                style="display: none;"
              >
            </div>

            <!-- Submission Actions -->
            <div class="submission-actions">
              <button 
                type="submit" 
                class="btn primary"
                [disabled]="submissionForm.invalid || submitting || !selectedFile"
              >
                <span *ngIf="submitting" class="spinner-small"></span>
                {{ submitting ? 'Submitting...' : (isOverdue() ? 'Submit Late' : 'Submit Assignment') }}
              </button>
              
              <button 
                type="button" 
                class="btn secondary"
                (click)="clearFile()"
                [disabled]="submitting || !selectedFile"
              >
                🗑️ Clear File
              </button>
            </div>
          </form>
        </div>

        <!-- Assignment Stats -->
        <div class="stats-section">
          <h2>Assignment Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">❓</div>
              <div class="stat-content">
                <h3>{{ assignment.questions?.length || 0 }}</h3>
                <p>Total Questions</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <h3>{{ getTotalPoints() }}</h3>
                <p>Total Points</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">⏰</div>
              <div class="stat-content">
                <h3>{{ getTimeRemaining() }}</h3>
                <p>Time Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assignment-detail-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 3rem;
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

    .retry-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .retry-btn:hover {
      background: #2980b9;
    }

    .assignment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #ecf0f1;
    }

    .header-info h1 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    .meta-tags {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .subject-tag, .teacher-tag, .due-date-tag {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .subject-tag {
      background: #3498db;
      color: white;
    }

    .teacher-tag {
      background: #9b59b6;
      color: white;
    }

    .due-date-tag {
      background: #27ae60;
      color: white;
    }

    .due-date-tag.overdue {
      background: #e74c3c;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .description-section {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .description-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .description-header h2 {
      color: #2c3e50;
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .submission-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: #f0f9f0;
      color: #27ae60;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-icon {
      font-size: 0.85rem;
    }

    .status-text {
      color: #27ae60;
    }

    .description-content p {
      color: #7f8c8d;
      line-height: 1.4;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .submission-info-inline {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #ecf0f1;
    }

    .submission-info-inline .submission-date {
      color: #7f8c8d;
      font-size: 0.8rem;
      font-style: italic;
    }

    .submission-status {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .submission-status.completed {
      border-left: 4px solid #27ae60;
    }

    .status-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .status-content h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .status-content p {
      color: #7f8c8d;
      margin-bottom: 1rem;
    }

    .submission-date {
      color: #7f8c8d;
      font-size: 0.9rem;
      font-style: italic;
    }

    .submission-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .submission-section h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .submission-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .file-upload-section {
      text-align: center;
    }

    .file-label {
      display: inline-block;
      cursor: pointer;
      width: 100%;
    }

    .file-upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      border: 2px dashed #ecf0f1;
      border-radius: 12px;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }

    .file-upload-area:hover {
      border-color: #3498db;
      background: #f1f3f4;
    }

    .file-upload-area.has-file {
      border-color: #27ae60;
      background: #f0f9f0;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #7f8c8d;
    }

    .upload-text {
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .upload-text span {
      display: block;
      color: #2c3e50;
      font-weight: 500;
      font-size: 1.1rem;
    }

    .file-name {
      color: #27ae60 !important;
      font-weight: 600 !important;
    }

    .upload-hint {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .file-input {
      display: none;
    }

    .submission-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 2px solid #ecf0f1;
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

    .stats-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stats-section h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      flex: 1;
      min-width: 150px;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-content h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 1.5rem;
    }

    .stat-content p {
      color: #7f8c8d;
      margin: 0;
      font-size: 0.9rem;
    }

    .submission-details {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .submission-details h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }

    .submission-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .submission-file {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .file-icon {
      font-size: 1.5rem;
      color: #3498db;
    }

    .file-details h4 {
      color: #2c3e50;
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
    }

    .file-name {
      color: #27ae60;
      font-weight: 600;
      margin: 0 0 0.125rem 0;
      font-size: 0.85rem;
    }

    .submission-time {
      color: #7f8c8d;
      font-size: 0.75rem;
    }

    .file-actions {
      display: flex;
      gap: 0.5rem;
    }

    .submission-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-label {
      color: #7f8c8d;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .meta-value {
      color: #2c3e50;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .meta-value.status-completed {
      color: #27ae60;
    }

    .meta-value.overdue {
      color: #e74c3c;
    }

    @media (max-width: 768px) {
      .assignment-detail-container {
        padding: 1rem;
      }

      .assignment-header {
        flex-direction: column;
        gap: 1rem;
      }

      .meta-tags {
        justify-content: center;
      }

      .submission-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssignmentDetailComponent implements OnInit {
  assignment: Assignment | null = null;
  loading = true;
  error: string | null = null;
  submitting = false;
  submissionForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.submissionForm = this.fb.group({
      assignmentFile: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAssignment();
  }

  loadAssignment(): void {
    this.loading = true;
    this.error = null;

    const assignmentId = this.route.snapshot.paramMap.get('id');
    if (!assignmentId) {
      this.error = 'Assignment ID not found';
      this.loading = false;
      return;
    }

    // Use getStudentAssignments to get assignment with submission status
    this.apiService.getStudentAssignments().subscribe({
      next: (assignments) => {
        // Find the specific assignment by ID
        this.assignment = assignments.find(a => a._id === assignmentId) || null;
        
        if (!this.assignment) {
          this.error = 'Assignment not found';
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load assignment';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.submissionForm.invalid || !this.assignment || !this.selectedFile) {
      return;
    }

    this.submitting = true;
    this.error = null;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Call the API service to submit the assignment
    this.apiService.submitAssignmentFile(this.assignment._id, formData).subscribe({
      next: (response: any) => {
        this.submitting = false;
        // Show success message and redirect
        alert('Assignment submitted successfully!');
        this.router.navigate(['/student/assignments']);
      },
      error: (err: any) => {
        this.submitting = false;
        this.error = err.message || 'Failed to submit assignment';
        console.error('Submission error:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(this.selectedFile.type)) {
        this.error = 'Please select a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)';
        this.selectedFile = null;
        return;
      }
      
      // Validate file size (max 10MB)
      if (this.selectedFile.size > 10 * 1024 * 1024) {
        this.error = 'File size must be less than 10MB';
        this.selectedFile = null;
        return;
      }
      
      this.error = null;
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.submissionForm.patchValue({ assignmentFile: '' });
    this.error = null;
  }

  goBack(): void {
    this.router.navigate(['/student/assignments']);
  }

  isOverdue(): boolean {
    if (!this.assignment) return false;
    return new Date(this.assignment.dueDate) < new Date();
  }

  getTotalPoints(): number {
    if (!this.assignment?.questions) return 0;
    return this.assignment.questions.reduce((total, question) => {
      return total + (question.points || 1);
    }, 0);
  }

  getTimeRemaining(): string {
    if (!this.assignment) return 'N/A';
    
    const now = new Date();
    const dueDate = new Date(this.assignment.dueDate);
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Less than 1h';
  }

  getSubmittedFileName(): string {
    if (!this.assignment || !this.assignment.assignmentSubmitted) return 'N/A';
    
    // Find the current student's submission
    const studentSubmission = this.assignment.assignmentSubmitted.find(
      (submission: any) => submission.student === this.getCurrentStudentId()
    );
    
    return studentSubmission?.answerpdf || 'N/A';
  }

  getCurrentStudentId(): string {
    // Get student ID from localStorage or auth service
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || '';
  }

  downloadSubmission(): void {
    if (!this.assignment) return;
    
    const fileName = this.getSubmittedFileName();
    if (fileName === 'N/A') {
      this.error = 'No submission file found';
      return;
    }
    
    // Create download link for the file
    const downloadUrl = `http://localhost:3000/public/uploads/${fileName}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
