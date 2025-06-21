import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Assignment, Student } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Student Dashboard</h1>
        <p class="welcome-text">Welcome back, {{ student?.name || 'Student' }}! Here's your academic overview.</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid" *ngIf="assignments.length > 0">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <h3>{{ totalAssignments }}</h3>
            <p>Total Assignments</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>{{ pendingAssignments }}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ completedAssignments }}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>{{ upcomingDeadlines }}</h3>
            <p>Due This Week</p>
          </div>
        </div>
      </div>

      <!-- Recent Assignments -->
      <div class="recent-section" *ngIf="recentAssignments.length > 0">
        <h2>Recent Assignments</h2>
        <div class="assignments-grid">
          <div class="assignment-card" *ngFor="let assignment of recentAssignments.slice(0, 4)">
            <div class="assignment-header">
              <h3>{{ assignment.title }}</h3>
              <span class="subject-tag">{{ assignment.subject }}</span>
            </div>
            <p class="assignment-desc">{{ assignment.description | slice:0:80 }}{{ assignment.description.length > 80 ? '...' : '' }}</p>
            <div class="assignment-footer">
              <span class="due-date" [class.overdue]="isOverdue(assignment.dueDate)">
                Due: {{ assignment.dueDate | date:'shortDate' }}
              </span>
              <button class="view-btn" 
                      [class.submitted]="assignment.isSubmitted"
                      [class.overdue]="!assignment.isSubmitted && isOverdue(assignment.dueDate)"
                      [routerLink]="['/student/assignments', assignment._id]">
                {{ getButtonText(assignment) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="progress-section" *ngIf="assignments.length > 0">
        <h2>Progress Overview</h2>
        <div class="progress-grid">
          <div class="progress-card">
            <div class="progress-header">
              <h3>Overall Progress</h3>
              <span class="progress-percentage">{{ getOverallProgress() }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="getOverallProgress()"></div>
            </div>
            <div class="progress-stats">
              <span>{{ completedAssignments }} of {{ totalAssignments }} completed</span>
            </div>
          </div>
          
          <div class="progress-card">
            <div class="progress-header">
              <h3>This Week</h3>
              <span class="progress-percentage">{{ getWeeklyProgress() }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="getWeeklyProgress()"></div>
            </div>
            <div class="progress-stats">
              <span>{{ getWeeklyCompleted() }} assignments due this week</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="assignments.length === 0 && !loading">
        <div class="empty-icon">📚</div>
        <h3>No assignments yet</h3>
        <p>You don't have any assignments assigned to you yet. Check back later!</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>Error loading dashboard: {{ error }}</p>
        <button class="retry-btn" (click)="loadDashboardData()">Retry</button>
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

    .recent-section, .progress-section {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .recent-section h2, .progress-section h2 {
      color: #2c3e50;
      margin-bottom: 0.75rem;
      font-size: 1.2rem;
    }

    .assignments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.75rem;
    }

    .assignment-card {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 0.75rem;
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
      font-size: 1rem;
      font-weight: 600;
    }

    .subject-tag {
      background: #3498db;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .assignment-desc {
      color: #7f8c8d;
      margin-bottom: 0.75rem;
      line-height: 1.3;
      font-size: 0.9rem;
    }

    .assignment-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .due-date {
      color: #7f8c8d;
      font-size: 0.85rem;
    }

    .due-date.overdue {
      color: #e74c3c;
      font-weight: 500;
    }

    .view-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .view-btn:hover {
      background: #229954;
    }

    .view-btn.submitted {
      background: #3498db;
    }

    .view-btn.submitted:hover {
      background: #2980b9;
    }

    .view-btn.overdue {
      background: #e74c3c;
    }

    .view-btn.overdue:hover {
      background: #c0392b;
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .progress-card {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .progress-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .progress-percentage {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3498db;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2980b9);
      transition: width 0.3s ease;
    }

    .progress-stats {
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

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .assignments-grid {
        grid-template-columns: 1fr;
      }

      .progress-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  student: Student | null = null;
  assignments: Assignment[] = [];
  recentAssignments: Assignment[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load student profile
    this.apiService.getStudentProfile().subscribe({
      next: (data) => {
        this.student = data;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load student profile';
        this.loading = false;
      }
    });

    // Load assignments with submission status
    this.apiService.getStudentAssignments().subscribe({
      next: (data) => {
        this.assignments = data;
        this.recentAssignments = data.slice(0, 4);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load assignments';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  get totalAssignments(): number {
    return this.assignments.length;
  }

  get pendingAssignments(): number {
    return this.assignments.filter(a => !a.isSubmitted).length;
  }

  get completedAssignments(): number {
    return this.assignments.filter(a => a.isSubmitted).length;
  }

  get upcomingDeadlines(): number {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= now && dueDate <= weekFromNow && !a.isSubmitted;
    }).length;
  }

  isCompleted(assignment: Assignment): boolean {
    return assignment.isSubmitted || false;
  }

  getOverallProgress(): number {
    if (this.totalAssignments === 0) return 0;
    return Math.round((this.completedAssignments / this.totalAssignments) * 100);
  }

  getWeeklyProgress(): number {
    const weeklyAssignments = this.getWeeklyAssignments();
    if (weeklyAssignments.length === 0) return 0;
    const completed = weeklyAssignments.filter(a => a.isSubmitted).length;
    return Math.round((completed / weeklyAssignments.length) * 100);
  }

  getWeeklyAssignments(): Assignment[] {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= now && dueDate <= weekFromNow;
    });
  }

  getWeeklyCompleted(): number {
    return this.getWeeklyAssignments().filter(a => a.isSubmitted).length;
  }

  getButtonText(assignment: Assignment): string {
    if (assignment.isSubmitted) {
      return 'View Submission';
    } else if (this.isOverdue(assignment.dueDate)) {
      return 'Submit Late';
    } else {
      return 'View Details';
    }
  }
}
