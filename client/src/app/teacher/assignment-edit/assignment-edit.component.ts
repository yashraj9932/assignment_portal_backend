import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Assignment } from '../../core/api.service';

@Component({
  selector: 'app-teacher-assignment-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="edit-assignment-container">
      <div class="header-section">
        <h1>Edit Assignment</h1>
        <p>Update your assignment details, questions, and settings</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading assignment...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>Error loading assignment: {{ error }}</p>
        <button class="retry-btn" (click)="loadAssignment()">Retry</button>
      </div>

      <!-- Edit Form -->
      <form [formGroup]="assignmentForm" (ngSubmit)="onSubmit()" class="assignment-form" *ngIf="!loading && !error">
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
          <button type="button" class="btn-secondary" (click)="cancel()" [disabled]="submitting">
            Cancel
          </button>
          <button type="button" class="btn-secondary" (click)="saveAsDraft()" [disabled]="submitting">
            Save as Draft
          </button>
          <button type="submit" class="btn-primary" [disabled]="submitting || assignmentForm.invalid">
            <span class="spinner" *ngIf="submitting"></span>
            {{ submitting ? 'Updating...' : 'Update Assignment' }}
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div class="success-message" *ngIf="successMessage">
        <div class="success-content">
          <span class="success-icon">✅</span>
          <h3>{{ successMessage }}</h3>
          <p>Your assignment has been updated successfully!</p>
          <div class="success-actions">
            <button class="btn-secondary" routerLink="/teacher/assignments">View All Assignments</button>
            <button class="btn-primary" (click)="viewAssignment()">View Assignment</button>
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
    .edit-assignment-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-section h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
    }

    .header-section p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
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
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-input.error, .form-select.error, .form-textarea.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .add-question-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .add-question-btn:hover {
      background: #229954;
    }

    .questions-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .question-item {
      border: 2px solid #ecf0f1;
      border-radius: 12px;
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
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .remove-question-btn:hover {
      background: #c0392b;
    }

    .question-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
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
      border-radius: 8px;
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

    .btn-secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #bdc3c7;
    }

    .btn-primary:disabled, .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .edit-assignment-container {
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

      .question-content {
        grid-template-columns: 1fr;
      }

      .success-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AssignmentEditComponent implements OnInit {
  assignmentForm: FormGroup;
  submitting = false;
  loading = true;
  successMessage = '';
  errorMessage = '';
  error = '';
  assignmentId = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.assignmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dueDate: ['', Validators.required],
      status: ['draft'],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.assignmentId = this.route.snapshot.params['id'];
    if (this.assignmentId) {
      this.loadAssignment();
    } else {
      this.error = 'Assignment ID not found';
      this.loading = false;
    }
  }

  get questionsArray() {
    return this.assignmentForm.get('questions') as FormArray;
  }

  loadAssignment(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getAssignment(this.assignmentId).subscribe({
      next: (assignment) => {
        this.populateForm(assignment);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load assignment';
        this.loading = false;
      }
    });
  }

  populateForm(assignment: Assignment): void {
    // Clear existing questions
    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }

    // Populate basic fields
    this.assignmentForm.patchValue({
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description,
      dueDate: this.formatDateForInput(assignment.dueDate),
      status: assignment.status || 'draft'
    });

    // Populate questions
    if (assignment.questions && assignment.questions.length > 0) {
      assignment.questions.forEach((question: any) => {
        const questionGroup = this.fb.group({
          text: [question.text || question, Validators.required],
          type: [question.type || 'text'],
          points: [question.points || 10, [Validators.required, Validators.min(1)]]
        });
        this.questionsArray.push(questionGroup);
      });
    } else {
      // Add a default question if none exist
      this.addQuestion();
    }
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

      this.apiService.updateAssignment(this.assignmentId, assignmentData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = 'Assignment updated successfully!';
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.message || 'Failed to update assignment';
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

  cancel() {
    this.router.navigate(['/teacher/assignments']);
  }

  viewAssignment() {
    this.router.navigate(['/teacher/assignments', this.assignmentId]);
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
} 