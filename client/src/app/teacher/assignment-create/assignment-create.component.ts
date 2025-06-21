import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Assignment } from '../../core/api.service';

@Component({
  selector: 'app-teacher-assignment-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="create-assignment-container">
      <div class="header-section">
        <h1>Create New Assignment</h1>
        <p class="welcome-text">Design and configure your assignment with questions, due dates, and instructions</p>
      </div>

      <form [formGroup]="assignmentForm" (ngSubmit)="onSubmit()" class="assignment-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h2>Basic Information</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="title">Assignment Title *</label>
              <input 
                type="text" 
                id="title"
                formControlName="title"
                placeholder="Enter assignment title"
                class="form-input"
                [class.error]="isFieldInvalid('title')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('title')">
                {{ getFieldError('title') }}
              </div>
            </div>

            <div class="form-group">
              <label for="subject">Subject *</label>
              <select 
                id="subject"
                formControlName="subject"
                class="form-select"
                [class.error]="isFieldInvalid('subject')"
              >
                <option value="">Select a subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Computer Science">Computer Science</option>
              </select>
              <div class="error-message" *ngIf="isFieldInvalid('subject')">
                {{ getFieldError('subject') }}
              </div>
            </div>

            <div class="form-group full-width">
              <label for="description">Description *</label>
              <textarea 
                id="description"
                formControlName="description"
                placeholder="Provide detailed instructions for the assignment..."
                rows="4"
                class="form-textarea"
                [class.error]="isFieldInvalid('description')"
              ></textarea>
              <div class="error-message" *ngIf="isFieldInvalid('description')">
                {{ getFieldError('description') }}
              </div>
            </div>

            <div class="form-group">
              <label for="dueDate">Due Date *</label>
              <input 
                type="datetime-local" 
                id="dueDate"
                formControlName="dueDate"
                [min]="getCurrentDateTime()"
                class="form-input"
                [class.error]="isFieldInvalid('dueDate')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('dueDate')">
                {{ getFieldError('dueDate') }}
              </div>
            </div>

            <div class="form-group">
              <label for="status">Status</label>
              <select 
                id="status"
                formControlName="status"
                class="form-select"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="form-section">
          <div class="section-header">
            <h2>Questions</h2>
            <button type="button" class="add-question-btn" (click)="addQuestion()">
              <span class="btn-icon">➕</span>
              Add Question
            </button>
          </div>
          
          <div class="questions-container" formArrayName="questions">
            <div 
              class="question-item" 
              *ngFor="let question of questionsArray.controls; let i = index"
              [formGroupName]="i"
            >
              <div class="question-header">
                <h3>Question {{ i + 1 }}</h3>
                <button 
                  type="button" 
                  class="remove-question-btn"
                  (click)="removeQuestion(i)"
                  *ngIf="questionsArray.length > 1"
                >
                  🗑️ Remove
                </button>
              </div>

              <div class="question-content">
                <div class="form-group">
                  <label [for]="'questionText' + i">Question Text *</label>
                  <textarea 
                    [id]="'questionText' + i"
                    formControlName="text"
                    placeholder="Enter your question..."
                    rows="3"
                    class="form-textarea"
                    [class.error]="isQuestionFieldInvalid(i, 'text')"
                  ></textarea>
                  <div class="error-message" *ngIf="isQuestionFieldInvalid(i, 'text')">
                    Question text is required
                  </div>
                </div>

                <div class="form-group">
                  <label [for]="'questionPoints' + i">Points</label>
                  <input 
                    type="number"
                    [id]="'questionPoints' + i"
                    formControlName="points"
                    placeholder="10"
                    min="1"
                    class="form-input"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="no-questions" *ngIf="questionsArray.length === 0">
            <p>No questions added yet. Click "Add Question" to get started.</p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="saveAsDraft()" [disabled]="submitting">
            Save as Draft
          </button>
          <button type="submit" class="btn-primary" [disabled]="submitting || assignmentForm.invalid">
            <span class="spinner" *ngIf="submitting"></span>
            {{ submitting ? 'Creating...' : 'Create Assignment' }}
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div class="success-message" *ngIf="successMessage">
        <div class="success-content">
          <span class="success-icon">✅</span>
          <h3>{{ successMessage }}</h3>
          <p>Your assignment has been created successfully!</p>
          <div class="success-actions">
            <button class="btn-secondary" routerLink="/teacher/assignments">View All Assignments</button>
            <button class="btn-primary" (click)="createAnother()">Create Another</button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="errorMessage">
        <div class="error-content">
          <span class="error-icon">❌</span>
          <h3>Error</h3>
          <p>{{ errorMessage }}</p>
          <button class="retry-btn" (click)="clearError()">Try Again</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-assignment-container {
      padding: 2rem;
      max-width: 800px;
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

    .assignment-form {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .add-question-btn {
      display: flex;
      align-items: center;
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .add-question-btn:hover {
      background: #229954;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

    .form-input.error, .form-select.error, .form-textarea.error {
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

    .questions-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .question-item {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .question-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .remove-question-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .remove-question-btn:hover {
      background: #c0392b;
    }

    .question-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .no-questions {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #ecf0f1;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
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

    .btn-secondary:hover:not(:disabled) {
      background: #bdc3c7;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .success-message, .error-message {
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

    .success-content, .error-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      width: 90%;
    }

    .success-icon, .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .success-content h3 {
      color: #27ae60;
      margin-bottom: 0.5rem;
    }

    .error-content h3 {
      color: #e74c3c;
      margin-bottom: 0.5rem;
    }

    .success-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: center;
    }

    .retry-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .create-assignment-container {
        padding: 1rem;
      }

      .assignment-form {
        padding: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .form-actions {
        flex-direction: column;
      }

      .success-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AssignmentCreateComponent implements OnInit {
  assignmentForm: FormGroup;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.assignmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dueDate: [this.getDefaultDueDate(), Validators.required],
      status: ['draft'],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Add a default question
    this.addQuestion();
  }

  get questionsArray() {
    return this.assignmentForm.get('questions') as FormArray;
  }

  addQuestion() {
    const question = this.fb.group({
      text: ['', Validators.required],
      type: ['text'],
      points: [10, [Validators.required, Validators.min(1)]]
    });

    this.questionsArray.push(question);
  }

  removeQuestion(index: number) {
    this.questionsArray.removeAt(index);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.assignmentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.assignmentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
    }
    return '';
  }

  isQuestionFieldInvalid(questionIndex: number, fieldName: string): boolean {
    const question = this.questionsArray.at(questionIndex);
    const field = question.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.assignmentForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formValue = this.assignmentForm.value;
      
      // Prepare assignment data
      const assignmentData = {
        title: formValue.title,
        subject: formValue.subject,
        description: formValue.description,
        dueDate: formValue.dueDate,
        status: formValue.status,
        questions: formValue.questions.map((q: any) => ({
          text: q.text,
          type: q.type,
          points: q.points
        }))
      };

      this.apiService.createAssignment(assignmentData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = 'Assignment created successfully!';
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.message || 'Failed to create assignment';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  saveAsDraft() {
    this.assignmentForm.patchValue({ status: 'draft' });
    this.onSubmit();
  }

  createAnother() {
    this.successMessage = '';
    this.assignmentForm.reset({ status: 'draft' });
    this.questionsArray.clear();
    this.addQuestion();
  }

  clearError() {
    this.errorMessage = '';
  }

  private markFormGroupTouched() {
    Object.keys(this.assignmentForm.controls).forEach(key => {
      const control = this.assignmentForm.get(key);
      control?.markAsTouched();
    });
  }

  getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  getDefaultDueDate(): string {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // Add 7 days
    
    const year = oneWeekLater.getFullYear();
    const month = String(oneWeekLater.getMonth() + 1).padStart(2, '0');
    const day = String(oneWeekLater.getDate()).padStart(2, '0');
    const hours = String(oneWeekLater.getHours()).padStart(2, '0');
    const minutes = String(oneWeekLater.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
