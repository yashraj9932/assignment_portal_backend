import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, Assignment } from '../../core/api.service';

@Component({
  selector: 'app-student-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="assignments-container">
      <div class="header-section">
        <h1>My Assignments</h1>
        <p>Manage and submit your assignments</p>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [formControl]="searchControl" 
            placeholder="Search assignments..."
            class="search-input"
          >
        </div>

        <select [formControl]="statusFilter" class="filter-select">
          <option value="all">All Assignments</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select [formControl]="sortBy" class="filter-select">
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
          <option value="subject">Subject</option>
          <option value="createdAt">Created Date</option>
        </select>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading assignments...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredAssignments.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No assignments found</h3>
        <p>You don't have any assignments yet. Try adjusting your filters.</p>
      </div>

      <!-- Assignments Grid -->
      <div class="assignments-grid" *ngIf="!loading && filteredAssignments.length > 0">
        <div 
          *ngFor="let assignment of filteredAssignments" 
          class="assignment-card"
          [class.overdue]="isOverdue(assignment)"
        >
          <div class="assignment-header">
            <div class="assignment-title">
              <h3>{{ assignment.title }}</h3>
              <span class="subject-tag">{{ assignment.subject }}</span>
            </div>
            <div class="status-badge" [class]="getStatusClass(assignment)">
              {{ getStatusText(assignment) }}
            </div>
          </div>

          <div class="assignment-content">
            <p class="description">{{ assignment.description }}</p>
            
            <div class="meta-info">
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span>Due: {{ assignment.dueDate | date:'mediumDate' }}</span>
              </div>
              
              <div class="meta-item">
                <span class="meta-icon">👨‍🏫</span>
                <span>{{ assignment.teacher }}</span>
              </div>

              <div class="meta-item" *ngIf="assignment.questions">
                <span class="meta-icon">❓</span>
                <span>{{ assignment.questions.length }} questions</span>
              </div>
            </div>

            <div class="progress-section" *ngIf="assignment.questions">
              <div class="progress-info">
                <span>Progress</span>
                <span>{{ getProgressPercentage(assignment) }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="getProgressPercentage(assignment)"></div>
              </div>
            </div>
          </div>

          <div class="assignment-actions">
            <button class="btn primary" [routerLink]="['/student/assignments', assignment._id]">
              📋 View Details
            </button>
            
            <button 
              *ngIf="!isCompleted(assignment)" 
              class="btn secondary" 
              [routerLink]="['/student/assignments', assignment._id]"
            >
              {{ isOverdue(assignment) ? '⏰ Submit Late' : '✏️ Submit' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-state">
        <p>Error loading assignments: {{ error }}</p>
        <button class="retry-btn" (click)="loadAssignments()">Retry</button>
      </div>
    </div>
  `,
  styles: [`
    .assignments-container {
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

    .header-section p {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin: 0;
    }

    .filters-section {
      display: flex;
      gap: 4rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 250px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #7f8c8d;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3498db;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      min-width: 150px;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3498db;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #7f8c8d;
      margin-top: 1rem;
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 1rem;
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
    }

    .assignments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .assignment-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid transparent;
    }

    .assignment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .assignment-card.overdue {
      border-color: #e74c3c;
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
      font-size: 1.2rem;
    }

    .subject-tag {
      background: #3498db;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.pending {
      background: #f39c12;
      color: white;
    }

    .status-badge.completed {
      background: #27ae60;
      color: white;
    }

    .status-badge.overdue {
      background: #e74c3c;
      color: white;
    }

    .assignment-content {
      margin-bottom: 1.5rem;
    }

    .description {
      color: #7f8c8d;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .meta-info {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #7f8c8d;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .meta-icon {
      font-size: 1rem;
    }

    .progress-section {
      margin-top: 1rem;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #ecf0f1;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2980b9);
      transition: width 0.3s ease;
    }

    .assignment-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn.primary {
      background: #3498db;
      color: white;
    }

    .btn.primary:hover {
      background: #2980b9;
    }

    .btn.secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn.secondary:hover {
      background: #bdc3c7;
    }

    .error-state {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

    @media (max-width: 768px) {
      .assignments-container {
        padding: 1rem;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        min-width: auto;
      }

      .filter-select {
        min-width: auto;
      }

      .assignments-grid {
        grid-template-columns: 1fr;
      }

      .assignment-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AssignmentListComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  loading = true;
  error: string | null = null;

  searchControl = new FormControl('');
  statusFilter = new FormControl('all');
  sortBy = new FormControl('dueDate');

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAssignments();
    
    // Set up reactive filtering
    this.searchControl.valueChanges.subscribe(() => this.filterAssignments());
    this.statusFilter.valueChanges.subscribe(() => this.filterAssignments());
    this.sortBy.valueChanges.subscribe(() => this.filterAssignments());
  }

  loadAssignments(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getStudentAssignments().subscribe({
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
    let filtered = [...this.assignments];

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm) ||
        assignment.subject.toLowerCase().includes(searchTerm) ||
        assignment.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    const status = this.statusFilter.value;
    if (status !== 'all') {
      filtered = filtered.filter(assignment => {
        switch (status) {
          case 'pending':
            return !assignment.isSubmitted && !this.isOverdue(assignment);
          case 'completed':
            return assignment.isSubmitted;
          case 'overdue':
            return this.isOverdue(assignment) && !assignment.isSubmitted;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sortField = this.sortBy.value;
    filtered.sort((a, b) => {
      switch (sortField) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        case 'createdAt':
          return new Date(a.createdAt || new Date()).getTime() - new Date(b.createdAt || new Date()).getTime();
        default:
          return 0;
      }
    });

    this.filteredAssignments = filtered;
  }

  isCompleted(assignment: Assignment): boolean {
    return assignment.isSubmitted || false;
  }

  isOverdue(assignment: Assignment): boolean {
    return new Date(assignment.dueDate) < new Date();
  }

  getStatusText(assignment: Assignment): string {
    if (assignment.isSubmitted) {
      return 'Completed';
    } else if (this.isOverdue(assignment)) {
      return 'Overdue';
    } else {
      return 'Pending';
    }
  }

  getStatusClass(assignment: Assignment): string {
    if (assignment.isSubmitted) {
      return 'completed';
    } else if (this.isOverdue(assignment)) {
      return 'overdue';
    } else {
      return 'pending';
    }
  }

  getProgressPercentage(assignment: Assignment): number {
    if (!assignment.questions || assignment.questions.length === 0) {
      return 0;
    }
    
    // Return 100% if submitted, 0% if not
    return assignment.isSubmitted ? 100 : 0;
  }
}
