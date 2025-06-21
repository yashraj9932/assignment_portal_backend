import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Assignment } from '../../core/api.service';

@Component({
  selector: 'app-teacher-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="assignment-list-container">
      <div class="header-section">
        <div class="header-content">
          <h1>My Assignments</h1>
          <p>Manage and view all your created assignments</p>
        </div>
        <button class="create-btn" routerLink="/teacher/assignments/create">
          <span class="btn-icon">➕</span>
          Create New Assignment
        </button>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search assignments..." 
            [(ngModel)]="searchTerm"
            (input)="filterAssignments()"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-options">
          <select [(ngModel)]="statusFilter" (change)="filterAssignments()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
          <select [(ngModel)]="subjectFilter" (change)="filterAssignments()" class="filter-select">
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="History">History</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-section" *ngIf="assignments.length > 0">
        <div class="stat-item">
          <span class="stat-number">{{ totalAssignments }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ activeAssignments }}</span>
          <span class="stat-label">Active</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ completedAssignments }}</span>
          <span class="stat-label">Completed</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalSubmissions }}</span>
          <span class="stat-label">Submissions</span>
        </div>
      </div>

      <!-- Assignments Grid -->
      <div class="assignments-grid" *ngIf="filteredAssignments.length > 0">
        <div class="assignment-card" *ngFor="let assignment of filteredAssignments">
          <div class="assignment-header">
            <div class="assignment-title">
              <h3>{{ assignment.title }}</h3>
              <span class="status-badge" [class]="assignment.status">{{ assignment.status }}</span>
            </div>
            <div class="assignment-actions">
              <button class="action-btn edit" [routerLink]="['/teacher/assignments', assignment._id, 'edit']">
                ✏️ Edit
              </button>
              <button class="action-btn view" [routerLink]="['/teacher/assignments', assignment._id]">
                👁️ View
              </button>
              <button class="action-btn delete" (click)="deleteAssignment(assignment)">
                🗑️ Delete
              </button>
            </div>
          </div>
          
          <div class="assignment-content">
            <p class="assignment-description">{{ assignment.description | slice:0:150 }}{{ assignment.description.length > 150 ? '...' : '' }}</p>
            
            <div class="assignment-meta">
              <div class="meta-item">
                <span class="meta-label">Subject:</span>
                <span class="meta-value">{{ assignment.subject }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Due Date:</span>
                <span class="meta-value" [class.overdue]="isOverdue(assignment.dueDate)">
                  {{ assignment.dueDate | date:'mediumDate' }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Created:</span>
                <span class="meta-value">{{ assignment.createdAt | date:'shortDate' }}</span>
              </div>
            </div>

            <div class="assignment-stats">
              <div class="stat">
                <span class="stat-icon">📝</span>
                <span class="stat-text">{{ assignment.questions?.length || 0 }} Questions</span>
              </div>
              <div class="stat">
                <span class="stat-icon">👥</span>
                <span class="stat-text">{{ getSubmissionCount(assignment) }} Submissions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredAssignments.length === 0 && !loading">
        <div class="empty-icon">📚</div>
        <h3>No assignments found</h3>
        <p *ngIf="searchTerm || statusFilter || subjectFilter">
          No assignments match your current filters. Try adjusting your search criteria.
        </p>
        <p *ngIf="!searchTerm && !statusFilter && !subjectFilter">
          You haven't created any assignments yet. Start by creating your first assignment!
        </p>
        <button class="create-btn" routerLink="/teacher/assignments/create" *ngIf="!searchTerm && !statusFilter && !subjectFilter">
          Create Your First Assignment
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading assignments...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>Error loading assignments: {{ error }}</p>
        <button class="retry-btn" (click)="loadAssignments()">Retry</button>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Delete Assignment</h3>
            <button class="close-btn" (click)="cancelDelete()">✕</button>
          </div>
          <div class="modal-body">
            <div class="warning-header">
              <div class="warning-icon">⚠️</div>
              <h4>Are you sure you want to delete this assignment?</h4>
            </div>
            <p class="warning-text">
              This action cannot be undone.
            </p>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="cancelDelete()">Cancel</button>
            <button class="btn-danger" (click)="confirmDelete()" [disabled]="deleting">
              <span class="spinner" *ngIf="deleting"></span>
              {{ deleting ? 'Deleting...' : 'Delete Assignment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assignment-list-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      color: #2c3e50;
      margin: 0 0 0.25rem 0;
      font-size: 1.8rem;
    }

    .header-content p {
      color: #7f8c8d;
      margin: 0;
      font-size: 0.9rem;
    }

    .create-btn {
      display: flex;
      align-items: center;
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
      text-decoration: none;
    }

    .create-btn:hover {
      background: #229954;
    }

    .btn-icon {
      margin-right: 0.5rem;
    }

    .filters-section {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 300px;
      max-width: 500px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #7f8c8d;
      z-index: 1;
    }

    .filter-options {
      display: flex;
      gap: 1rem;
      flex-shrink: 0;
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      font-size: 1rem;
      min-width: 140px;
      cursor: pointer;
    }

    .stats-section {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      min-width: 100px;
    }

    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .assignments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .assignment-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .assignment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .assignment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .assignment-title h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1.25rem;
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

    .assignment-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
      margin-left: 0.5rem;
    }

    .action-btn.edit {
      background: #3498db;
      color: white;
    }

    .action-btn.edit:hover {
      background: #2980b9;
    }

    .action-btn.view {
      background: #27ae60;
      color: white;
    }

    .action-btn.view:hover {
      background: #229954;
    }

    .action-btn.delete {
      background: #e74c3c;
      color: white;
    }

    .action-btn.delete:hover {
      background: #c0392b;
    }

    .assignment-content {
      margin-bottom: 1rem;
    }

    .assignment-description {
      color: #7f8c8d;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .assignment-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 0.8rem;
      color: #7f8c8d;
      font-weight: 500;
    }

    .meta-value {
      color: #2c3e50;
      font-weight: 500;
    }

    .meta-value.overdue {
      color: #e74c3c;
    }

    .assignment-stats {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #ecf0f1;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stat-icon {
      font-size: 1.1rem;
    }

    .stat-text {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #7f8c8d;
      margin-bottom: 1.5rem;
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

    .retry-btn:hover {
      background: #2980b9;
    }

    /* Delete Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
      padding: 1rem 1rem 0 1rem;
      border-bottom: 1px solid #ecf0f1;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.2rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #7f8c8d;
      padding: 0.25rem;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: #ecf0f1;
    }

    .modal-body {
      padding: 1rem;
      text-align: center;
    }

    .warning-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }

    .warning-icon {
      font-size: 2rem;
      margin-right: 0.5rem;
    }

    .modal-body h4 {
      color: #2c3e50;
      margin: 0;
      font-size: 1rem;
    }

    .modal-body p {
      color: #7f8c8d;
      margin-bottom: 0.5rem;
    }

    .warning-text {
      color: #e74c3c !important;
      font-weight: 500;
      background: #fdf2f2;
      padding: 0.75rem;
      border-radius: 6px;
      border-left: 3px solid #e74c3c;
      margin-top: 0.75rem;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      padding: 0 1rem 1rem 1rem;
      justify-content: flex-end;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c0392b;
    }

    .btn-danger:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-danger .spinner {
      border: 2px solid #ffffff40;
      border-top: 2px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
    }

    @media (max-width: 768px) {
      .assignment-list-container {
        padding: 1rem;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .search-box {
        min-width: auto;
        max-width: none;
      }

      .filter-options {
        flex-direction: row;
        justify-content: space-between;
      }

      .filter-select {
        flex: 1;
        min-width: auto;
      }

      .assignments-grid {
        grid-template-columns: 1fr;
      }

      .assignment-header {
        flex-direction: column;
        gap: 1rem;
      }

      .assignment-actions {
        align-self: stretch;
        justify-content: space-between;
      }

      .assignment-meta {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssignmentListComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  loading = true;
  error: string | null = null;
  
  searchTerm = '';
  statusFilter = '';
  subjectFilter = '';

  showDeleteModal = false;
  assignmentToDelete: Assignment | null = null;
  deleting = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getTeacherAssignments().subscribe({
      next: (data) => {
        this.assignments = data;
        this.filterAssignments();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load assignments';
        this.loading = false;
      }
    });
  }

  filterAssignments(): void {
    this.filteredAssignments = this.assignments.filter(assignment => {
      const matchesSearch = !this.searchTerm || 
        assignment.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || assignment.status === this.statusFilter;
      const matchesSubject = !this.subjectFilter || assignment.subject === this.subjectFilter;
      
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  getSubmissionCount(assignment: Assignment): number {
    // Return the actual submission count from the assignment data
    // For now, return 0 until we have proper submission data
    return assignment.assignmentSubmitted?.length || 0;
  }

  get totalAssignments(): number {
    return this.assignments.length;
  }

  get activeAssignments(): number {
    return this.assignments.filter(a => a.status === 'active').length;
  }

  get completedAssignments(): number {
    return this.assignments.filter(a => a.status === 'completed').length;
  }

  get totalSubmissions(): number {
    return this.assignments.reduce((total, assignment) => {
      return total + this.getSubmissionCount(assignment);
    }, 0);
  }

  deleteAssignment(assignment: Assignment): void {
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      this.apiService.deleteAssignment(assignment._id).subscribe({
        next: () => {
          this.assignments = this.assignments.filter(a => a._id !== assignment._id);
          this.filteredAssignments = this.filteredAssignments.filter(a => a._id !== assignment._id);
        },
        error: (err) => {
          this.error = err.message || 'Failed to delete assignment';
        }
      });
    }
  }

  cancelDelete(): void {
    this.assignmentToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.assignmentToDelete) return;
    
    this.deleting = true;
    this.apiService.deleteAssignment(this.assignmentToDelete._id).subscribe({
      next: () => {
        // Remove the assignment from the local arrays
        this.assignments = this.assignments.filter(a => a._id !== this.assignmentToDelete!._id);
        this.filterAssignments(); // Re-filter to update the display
        this.assignmentToDelete = null;
        this.showDeleteModal = false;
        this.deleting = false;
      },
      error: (err) => {
        alert('Failed to delete assignment. Please try again.');
        this.deleting = false;
      }
    });
  }
}
