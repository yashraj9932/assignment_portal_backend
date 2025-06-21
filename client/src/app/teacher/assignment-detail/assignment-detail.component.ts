import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Assignment } from '../../core/api.service';

interface StudentSubmission {
  _id: string;
  studentName: string;
  studentEmail: string;
  answers: string[];
  submittedAt: string;
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
}

interface Question {
  text: string;
  points: number;
  type?: string;
}

@Component({
  selector: 'app-teacher-assignment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="assignment-detail-container">
      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading assignment details...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>Error loading assignment: {{ error }}</p>
        <button class="retry-btn" (click)="assignment && loadAssignment(assignment._id)">Retry</button>
      </div>

      <!-- Assignment Content -->
      <div class="assignment-content" *ngIf="assignment && !loading">
        <!-- Header Section -->
        <div class="header-section">
          <div class="header-content">
            <div class="breadcrumb">
              <a routerLink="/teacher/assignments">Assignments</a>
              <span class="separator">/</span>
              <span>{{ assignment.title }}</span>
            </div>
            <h1>{{ assignment.title }}</h1>
            <div class="assignment-meta">
              <span class="subject-tag">{{ assignment.subject }}</span>
              <span class="status-badge" [class]="assignment.status">{{ assignment.status }}</span>
              <span class="due-date" [class.overdue]="isOverdue(assignment.dueDate)">
                Due: {{ assignment.dueDate | date:'medium' }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" [routerLink]="['/teacher/assignments', assignment._id, 'edit']">
              ✏️ Edit Assignment
            </button>
            <button class="btn-primary" (click)="exportSubmissions()">
              📊 Export Data
            </button>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <h3>{{ assignment.questions?.length || 0 }}</h3>
              <p>Questions</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ submissions.length }}</h3>
              <p>Submissions</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{{ gradedSubmissions }}</h3>
              <p>Graded</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>{{ averageGrade }}%</h3>
              <p>Average Grade</p>
            </div>
          </div>
        </div>

        <!-- Assignment Details -->
        <div class="details-section">
          <h2>Assignment Details</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>Description:</label>
              <p>{{ assignment.description || 'No description available' }}</p>
            </div>
            <div class="detail-item">
              <label>Created:</label>
              <p>{{ assignment.createdAt ? (assignment.createdAt | date:'medium') : 'Date not available' }}</p>
            </div>
            <div class="detail-item">
              <label>Total Points:</label>
              <p>{{ getTotalPoints() }}</p>
            </div>
            <div class="detail-item">
              <label>Time Remaining:</label>
              <p [class.urgent]="isUrgent(assignment.dueDate)">
                {{ getTimeRemaining(assignment.dueDate) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="questions-section" *ngIf="assignment.questions?.length">
          <h2>Questions</h2>
          <div class="questions-list">
            <div class="question-item" *ngFor="let question of assignment.questions; let i = index">
              <div class="question-header">
                <h3>Question {{ i + 1 }}</h3>
                <ng-container *ngIf="isQuestionObject(question)">
                  <span class="points">{{ question.points }} points</span>
                </ng-container>
              </div>
              <p class="question-text">{{ isQuestionObject(question) ? question.text : question }}</p>
            </div>
          </div>
        </div>

        <!-- Submissions Section -->
        <div class="submissions-section">
          <div class="section-header">
            <h2>Student Submissions</h2>
            <div class="submission-filters">
              <select [(ngModel)]="statusFilter" (change)="filterSubmissions()" class="filter-select">
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
              <input 
                type="text" 
                placeholder="Search students..." 
                [(ngModel)]="searchTerm"
                (input)="filterSubmissions()"
                class="search-input"
              >
            </div>
          </div>

          <div class="submissions-table" *ngIf="filteredSubmissions.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let submission of filteredSubmissions">
                  <td>{{ submission.studentName }}</td>
                  <td>{{ submission.studentEmail }}</td>
                  <td>{{ submission.submittedAt | date:'short' }}</td>
                  <td>
                    <span class="status-badge" [class]="submission.status">
                      {{ submission.status }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="submission.grade !== undefined">{{ submission.grade }}%</span>
                    <span *ngIf="submission.grade === undefined">-</span>
                  </td>
                  <td>
                    <button class="action-btn view" (click)="viewSubmission(submission)">
                      👁️ View
                    </button>
                    <button class="action-btn grade" (click)="gradeSubmission(submission)" *ngIf="submission.status === 'submitted'">
                      📝 Grade
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="empty-submissions" *ngIf="filteredSubmissions.length === 0">
            <div class="empty-icon">📚</div>
            <h3>No submissions found</h3>
            <p *ngIf="searchTerm || statusFilter">
              No submissions match your current filters.
            </p>
            <p *ngIf="!searchTerm && !statusFilter">
              No students have submitted this assignment yet.
            </p>
          </div>
        </div>
      </div>

      <!-- Submission Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedSubmission" (click)="closeSubmissionModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedSubmission.studentName }}'s Submission</h3>
            <button class="close-btn" (click)="closeSubmissionModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="submission-info">
              <p><strong>Student:</strong> {{ selectedSubmission.studentName }}</p>
              <p><strong>Email:</strong> {{ selectedSubmission.studentEmail }}</p>
              <p><strong>Submitted:</strong> {{ selectedSubmission.submittedAt | date:'medium' }}</p>
              <p><strong>Status:</strong> 
                <span class="status-badge" [class]="selectedSubmission.status">
                  {{ selectedSubmission.status }}
                </span>
              </p>
            </div>

            <div class="answers-section">
              <h4>Answers</h4>
              <div class="answer-item" *ngFor="let answer of selectedSubmission.answers; let i = index">
                <div class="answer-header">
                  <h5>Question {{ i + 1 }}</h5>
                  <span class="points">{{ getQuestionPoints(i) }} points</span>
                </div>
                <div class="answer-content">
                  <p>{{ answer || 'No answer provided' }}</p>
                </div>
              </div>
            </div>

            <div class="grading-section" *ngIf="selectedSubmission.status === 'submitted'">
              <h4>Grade Submission</h4>
              <div class="grading-form">
                <div class="form-group">
                  <label for="grade">Grade (%)</label>
                  <input 
                    type="number" 
                    id="grade"
                    [(ngModel)]="gradingData.grade"
                    min="0" 
                    max="100"
                    class="form-input"
                  >
                </div>
                <div class="form-group">
                  <label for="feedback">Feedback</label>
                  <textarea 
                    id="feedback"
                    [(ngModel)]="gradingData.feedback"
                    rows="4"
                    class="form-textarea"
                    placeholder="Provide feedback for the student..."
                  ></textarea>
                </div>
                <div class="grading-actions">
                  <button class="btn-secondary" (click)="closeSubmissionModal()">Cancel</button>
                  <button class="btn-primary" (click)="saveGrade()" [disabled]="savingGrade">
                    {{ savingGrade ? 'Saving...' : 'Save Grade' }}
                  </button>
                </div>
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .breadcrumb {
      margin-bottom: 0.5rem;
    }

    .breadcrumb a {
      color: #3498db;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .separator {
      margin: 0 0.5rem;
      color: #7f8c8d;
    }

    .header-content h1 {
      color: #2c3e50;
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
    }

    .assignment-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .subject-tag {
      background: #3498db;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #3498db;
      color: white;
    }

    .status-badge.completed {
      background: #27ae60;
      color: white;
    }

    .status-badge.draft {
      background: #95a5a6;
      color: white;
    }

    .status-badge.submitted {
      background: #f39c12;
      color: white;
    }

    .status-badge.graded {
      background: #27ae60;
      color: white;
    }

    .due-date {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .due-date.overdue {
      color: #e74c3c;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
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

    .btn-primary:hover {
      background: #2980b9;
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2rem;
      margin-right: 1rem;
    }

    .stat-content h3 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 0;
    }

    .stat-content p {
      color: #7f8c8d;
      margin: 0;
    }

    .details-section, .questions-section, .submissions-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .details-section h2, .questions-section h2, .submissions-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .detail-item label {
      display: block;
      font-weight: 500;
      color: #7f8c8d;
      margin-bottom: 0.25rem;
    }

    .detail-item p {
      color: #2c3e50;
      margin: 0;
    }

    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .question-item {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 1rem;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .question-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .points {
      background: #3498db;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .question-text {
      color: #7f8c8d;
      margin: 0;
      line-height: 1.5;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .submission-filters {
      display: flex;
      gap: 1rem;
    }

    .filter-select, .search-input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .search-input {
      min-width: 200px;
    }

    .submissions-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
    }

    th {
      background: #f8f9fa;
      font-weight: 500;
      color: #2c3e50;
    }

    .action-btn {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      margin-right: 0.5rem;
    }

    .action-btn.view {
      background: #3498db;
      color: white;
    }

    .action-btn.grade {
      background: #f39c12;
      color: white;
    }

    .empty-submissions {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
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
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #ecf0f1;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #7f8c8d;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .submission-info {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .submission-info p {
      margin: 0.5rem 0;
    }

    .answers-section {
      margin-bottom: 2rem;
    }

    .answers-section h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .answer-item {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .answer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .answer-header h5 {
      margin: 0;
      color: #2c3e50;
    }

    .answer-content p {
      color: #7f8c8d;
      margin: 0;
      line-height: 1.5;
    }

    .grading-section {
      border-top: 1px solid #ecf0f1;
      padding-top: 1.5rem;
    }

    .grading-section h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .grading-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
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
      .assignment-detail-container {
        padding: 1rem;
      }

      .header-section {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: stretch;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
      }

      .submission-filters {
        flex-direction: column;
      }

      .submissions-table {
        font-size: 0.9rem;
      }

      th, td {
        padding: 0.5rem;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class AssignmentDetailComponent implements OnInit {
  assignment: Assignment | null = null;
  submissions: StudentSubmission[] = [];
  filteredSubmissions: StudentSubmission[] = [];
  selectedSubmission: StudentSubmission | null = null;
  loading = true;
  error: string | null = null;
  savingGrade = false;
  
  searchTerm = '';
  statusFilter = '';
  
  gradingData = {
    grade: 0,
    feedback: ''
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const assignmentId = params['id'];
      if (assignmentId) {
        this.loadAssignment(assignmentId);
      }
    });
  }

  loadAssignment(assignmentId: string): void {
    this.loading = true;
    this.error = null;

    this.apiService.getAssignment(assignmentId).subscribe({
      next: (data) => {
        this.assignment = data;
        this.loadSubmissions(assignmentId);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load assignment';
        this.loading = false;
      }
    });
  }

  loadSubmissions(assignmentId: string): void {
    this.apiService.getAssignmentSubmissions(assignmentId).subscribe({
      next: (submissions) => {
        // Map backend data to StudentSubmission interface
        this.submissions = submissions.map((sub: any) => ({
          _id: sub._id,
          studentName: sub.student?.name || 'Unknown',
          studentEmail: sub.student?.email || '',
          answers: sub.answers || [], // Adjust if you store answers differently
          submittedAt: sub.submittedAt || '', // Adjust if you store submission time
          status: sub.status || 'submitted', // Adjust if you store status
          grade: sub.grade,
          feedback: sub.feedback
        }));
        this.filteredSubmissions = this.submissions;
      },
      error: (err) => {
        this.submissions = [];
        this.filteredSubmissions = [];
      }
    });
  }

  filterSubmissions(): void {
    this.filteredSubmissions = this.submissions.filter(submission => {
      const matchesSearch = !this.searchTerm || 
        submission.studentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        submission.studentEmail.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || submission.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  viewSubmission(submission: StudentSubmission): void {
    this.selectedSubmission = submission;
    this.gradingData = {
      grade: submission.grade || 0,
      feedback: submission.feedback || ''
    };
  }

  gradeSubmission(submission: StudentSubmission): void {
    this.viewSubmission(submission);
  }

  closeSubmissionModal(): void {
    this.selectedSubmission = null;
    this.gradingData = { grade: 0, feedback: '' };
  }

  saveGrade(): void {
    if (!this.selectedSubmission) return;

    this.savingGrade = true;
    
    // Mock API call - this would update the submission
    setTimeout(() => {
      this.selectedSubmission!.status = 'graded';
      this.selectedSubmission!.grade = this.gradingData.grade;
      this.selectedSubmission!.feedback = this.gradingData.feedback;
      
      this.savingGrade = false;
      this.closeSubmissionModal();
      this.filterSubmissions();
    }, 1000);
  }

  exportSubmissions(): void {
    if (!this.assignment || this.submissions.length === 0) {
      alert('No submissions to export');
      return;
    }

    // Create CSV content
    const headers = [
      'Student Name',
      'Student Email', 
      'Submitted Date',
      'Status',
      'Grade (%)',
      'Feedback'
    ];

    // Add question columns
    if (this.assignment.questions) {
      this.assignment.questions.forEach((question: any, index: number) => {
        const questionText = this.isQuestionObject(question) ? question.text : question;
        headers.push(`Q${index + 1}: ${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}`);
      });
    }

    const csvContent = [
      headers.join(','),
      ...this.submissions.map(submission => {
        const row = [
          `"${submission.studentName}"`,
          `"${submission.studentEmail}"`,
          `"${submission.submittedAt}"`,
          `"${submission.status}"`,
          submission.grade !== undefined ? submission.grade.toString() : '',
          `"${submission.feedback || ''}"`
        ];

        // Add answers for each question
        if (this.assignment?.questions) {
          this.assignment.questions.forEach((question: any, index: number) => {
            const answer = submission.answers[index] || '';
            row.push(`"${answer.replace(/"/g, '""')}"`); // Escape quotes in CSV
          });
        }

        return row.join(',');
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.assignment.title}_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  isUrgent(dueDate: string): boolean {
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  }

  getTimeRemaining(dueDate: string): string {
    if (!dueDate) {
      return 'No due date set';
    }
    
    const due = new Date(dueDate);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(due.getTime())) {
      return 'Invalid due date';
    }
    
    const diff = due.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Overdue';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
  }

  getTotalPoints(): number {
    if (!this.assignment?.questions) return 0;
    
    return this.assignment.questions.reduce((total, question: any) => {
      // Handle both object format and string format
      if (this.isQuestionObject(question)) {
        return total + (question.points || 0);
      } else {
        // If it's a string, assume default points
        return total + 10;
      }
    }, 0);
  }

  get gradedSubmissions(): number {
    return this.submissions.filter(s => s.status === 'graded').length;
  }

  get averageGrade(): number {
    const graded = this.submissions.filter(s => s.grade !== undefined);
    if (graded.length === 0) return 0;
    const total = graded.reduce((sum, s) => sum + (s.grade || 0), 0);
    return Math.round(total / graded.length);
  }

  isQuestionObject(q: any): q is { text: string; points: number } {
    return q && typeof q === 'object' && 'text' in q && 'points' in q;
  }

  getQuestionPoints(index: number): number | '' {
    const q = this.assignment?.questions?.[index];
    return this.isQuestionObject(q) ? q.points : '';
  }
}
