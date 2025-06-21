import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatBadgeModule, 
    MatDividerModule,
    RouterModule
  ],
  template: `
    <mat-toolbar class="navbar" [class.scrolled]="isScrolled">
      <div class="navbar-brand">
        <mat-icon class="brand-icon">school</mat-icon>
        <span class="brand-text">Assignment Portal</span>
      </div>

      <div class="navbar-nav" *ngIf="isLoggedIn">
        <!-- Student Navigation -->
        <div *ngIf="userRole === 'student'" class="nav-links">
          <a mat-button 
             routerLink="/student/dashboard" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          
          <a mat-button 
             routerLink="/student/assignments" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>assignment</mat-icon>
            <span>Assignments</span>
            <mat-icon *ngIf="pendingAssignments > 0" 
                      class="notification-badge" 
                      [matBadge]="pendingAssignments" 
                      matBadgeColor="warn">
              notifications
            </mat-icon>
          </a>
          
          <a mat-button 
             routerLink="/student/profile" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </a>
        </div>

        <!-- Teacher Navigation -->
        <div *ngIf="userRole === 'teacher'" class="nav-links">
          <a mat-button 
             routerLink="/teacher/dashboard" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          
          <a mat-button 
             routerLink="/teacher/assignments" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>assignment</mat-icon>
            <span>Assignments</span>
          </a>
          
          <a mat-button 
             routerLink="/teacher/assignments/create" 
             routerLinkActive="active"
             class="nav-link create-btn">
            <mat-icon>add</mat-icon>
            <span>Create Assignment</span>
          </a>
          
          <a mat-button 
             routerLink="/teacher/profile" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </a>
        </div>
      </div>

      <div class="navbar-user" *ngIf="isLoggedIn">
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
          <div class="user-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
        </button>
        
        <mat-menu #userMenu="matMenu" class="user-menu">
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole | titlecase }}</div>
          </div>
          
          <mat-divider></mat-divider>
          
          <button mat-menu-item routerLink="/{{ userRole }}/profile">
            <mat-icon>person</mat-icon>
            <span>My Profile</span>
          </button>
          
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>

      <!-- Mobile Menu Button -->
      <button mat-icon-button 
              class="mobile-menu-btn" 
              (click)="toggleMobileMenu()"
              *ngIf="isLoggedIn">
        <mat-icon>menu</mat-icon>
      </button>
    </mat-toolbar>

    <!-- Mobile Navigation Menu -->
    <div class="mobile-nav" [class.open]="mobileMenuOpen" *ngIf="isLoggedIn">
      <div class="mobile-nav-content">
        <!-- Student Mobile Navigation -->
        <div *ngIf="userRole === 'student'" class="mobile-nav-links">
          <a mat-button 
             routerLink="/student/dashboard" 
             routerLinkActive="active"
             (click)="closeMobileMenu()"
             class="mobile-nav-link">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          
          <a mat-button 
             routerLink="/student/assignments" 
             routerLinkActive="active"
             (click)="closeMobileMenu()"
             class="mobile-nav-link">
            <mat-icon>assignment</mat-icon>
            <span>Assignments</span>
            <mat-icon *ngIf="pendingAssignments > 0" 
                      class="notification-badge" 
                      [matBadge]="pendingAssignments" 
                      matBadgeColor="warn">
              notifications
            </mat-icon>
          </a>
          
          <a mat-button 
             routerLink="/student/profile" 
             routerLinkActive="active"
             (click)="closeMobileMenu()"
             class="mobile-nav-link">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </a>
        </div>

        <!-- Teacher Mobile Navigation -->
        <div *ngIf="userRole === 'teacher'" class="mobile-nav-links">
          <a mat-button 
             routerLink="/teacher/dashboard" 
             routerLinkActive="active"
             (click)="closeMobileMenu()"
             class="mobile-nav-link">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          
          <a mat-button 
             routerLink="/teacher/assignments" 
             routerLinkActive="active"
             (click)="closeMobileMenu()"
             class="mobile-nav-link">
            <mat-icon>assignment</mat-icon>
            <span>Assignments</span>
          </a>
          
          <a mat-button 
             routerLink="/teacher/assignments/create" 
             routerLinkActive="active"
             (click)="closeMobileMenu()"
             class="mobile-nav-link create-btn">
            <mat-icon>add</mat-icon>
            <span>Create Assignment</span>
          </a>
          
          <a mat-button 
             routerLink="/teacher/profile" 
             routerLinkActive="active"
             (click)="closeMobileMenu()"
             class="mobile-nav-link">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </a>
        </div>

        <mat-divider></mat-divider>
        
        <div class="mobile-user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRole | titlecase }}</div>
        </div>
        
        <button mat-button 
                class="mobile-logout-btn"
                (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  userRole: string | null = null;
  userName: string = '';
  pendingAssignments = 0;
  isScrolled = false;
  mobileMenuOpen = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    
    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAuthStatus();
    });

    // Listen for scroll events
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 10;
    });
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    if (this.isLoggedIn) {
      this.userRole = this.auth.getRole();
      const user = this.auth.getUser();
      this.userName = user?.name || 'User';
      // TODO: Load pending assignments count from API
      this.pendingAssignments = 3; // Placeholder
    }
  }

  logout(): void {
    this.closeMobileMenu();
    this.auth.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
