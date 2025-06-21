import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, TeacherDashboard } from '../../core/api.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p class="welcome-text">Welcome back! Here's an overview of your teaching activities.</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid" *ngIf="dashboardData">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <h3>{{ dashboardData.totalAssignments }}</h3>
            <p>Total Assignments</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ dashboardData.totalStudents }}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>{{ dashboardData.recentSubmissions.length || 0 }}</h3>
            <p>Recent Submissions</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ getCompletedAssignments() }}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button class="action-btn primary" routerLink="/teacher/assignments/create">
            <span class="btn-icon">➕</span>
            Create Assignment
          </button>
          <button class="action-btn secondary" routerLink="/teacher/assignments">
            <span class="btn-icon">📋</span>
            View Assignments
          </button>
          <button class="action-btn secondary" routerLink="/teacher/profile">
            <span class="btn-icon">👤</span>
            Update Profile
          </button>
        </div>
      </div>

      <!-- Recent Assignments -->
      <div class="recent-section" *ngIf="dashboardData?.recentAssignments?.length">
        <h2>Recent Assignments</h2>
        <div class="assignments-grid">
          <div class="assignment-card" *ngFor="let assignment of dashboardData?.recentAssignments?.slice(0, 4)">
            <div class="assignment-header">
              <h3>{{ assignment.title }}</h3>
              <span class="subject-tag">{{ assignment.subject }}</span>
            </div>
            <p class="assignment-desc">{{ assignment.description | slice:0:100 }}{{ assignment.description.length > 100 ? '...' : '' }}</p>
            <div class="assignment-footer">
              <span class="due-date">Due: {{ assignment.dueDate | date:'shortDate' }}</span>
              <button class="view-btn" [routerLink]="['/teacher/assignments', assignment._id]">View Details</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Submissions -->
      <div class="recent-section" *ngIf="dashboardData?.recentSubmissions?.length">
        <h2>Recent Submissions</h2>
        <div class="submissions-list">
          <div class="submission-item" *ngFor="let submission of dashboardData?.recentSubmissions?.slice(0, 5)">
            <div class="submission-info">
              <h4>{{ submission.studentName }}</h4>
              <p>{{ submission.assignmentTitle }}</p>
            </div>
            <div class="submission-meta">
              <span class="submission-date">{{ submission.submittedAt | date:'short' }}</span>
              <span class="status-badge" [class]="submission.status">{{ submission.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>Error loading dashboard: {{ error }}</p>
        <button class="retry-btn" (click)="loadDashboard()">Retry</button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      margin-bottom: 0.25rem;
      font-size: 1.8rem;
    }

    .welcome-text {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .quick-actions h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      text-decoration: none;
    }

    .action-btn.primary {
      background: #3498db;
      color: white;
    }

    .action-btn.primary:hover {
      background: #2980b9;
    }

    .action-btn.secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .action-btn.secondary:hover {
      background: #bdc3c7;
    }

    .btn-icon {
      margin-right: 0.5rem;
    }

    .recent-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .recent-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .assignments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .assignment-card {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 1rem;
      transition: box-shadow 0.2s;
    }

    .assignment-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .assignment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .assignment-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .subject-tag {
      background: #3498db;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .assignment-desc {
      color: #7f8c8d;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .assignment-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .due-date {
      color: #e74c3c;
      font-size: 0.9rem;
    }

    .view-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .view-btn:hover {
      background: #229954;
    }

    .submissions-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .submission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
    }

    .submission-info h4 {
      margin: 0;
      color: #2c3e50;
    }

    .submission-info p {
      margin: 0.25rem 0 0 0;
      color: #7f8c8d;
    }

    .submission-meta {
      text-align: right;
    }

    .submission-date {
      display: block;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .status-badge.submitted {
      background: #f39c12;
      color: white;
    }

    .status-badge.graded {
      background: #27ae60;
      color: white;
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

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .action-buttons {
        flex-direction: column;
      }

      .assignments-grid {
        grid-template-columns: 1fr;
      }

      .submission-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .submission-meta {
        text-align: left;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardData: TeacherDashboard | null = null;
  loading = true;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getTeacherDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load dashboard';
        this.loading = false;
      }
    });
  }

  getCompletedAssignments(): number {
    if (!this.dashboardData?.recentAssignments) return 0;
    return this.dashboardData.recentAssignments.filter(assignment => 
      assignment.status === 'completed'
    ).length;
  }
}
