import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule, 
    MatIconModule, 
    RouterModule
  ],
  template: `
    <mat-nav-list *ngIf="role === 'student'">
      <a mat-list-item routerLink="/student/dashboard">Dashboard</a>
      <a mat-list-item routerLink="/student/assignments">Assignments</a>
      <a mat-list-item routerLink="/student/profile">Profile</a>
    </mat-nav-list>
    <mat-nav-list *ngIf="role === 'teacher'">
      <a mat-list-item routerLink="/teacher/dashboard">Dashboard</a>
      <a mat-list-item routerLink="/teacher/assignments">Assignments</a>
      <a mat-list-item routerLink="/teacher/assignments/create">Create Assignment</a>
      <a mat-list-item routerLink="/teacher/profile">Profile</a>
    </mat-nav-list>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  role: string | null = null;
  constructor(private auth: AuthService) {
    this.role = this.auth.getRole();
  }
}
