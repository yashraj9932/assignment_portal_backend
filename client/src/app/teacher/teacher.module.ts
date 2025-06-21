import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { AssignmentDetailComponent } from './assignment-detail/assignment-detail.component';
import { AssignmentCreateComponent } from './assignment-create/assignment-create.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'assignments', component: AssignmentListComponent },
  { path: 'assignments/create', component: AssignmentCreateComponent },
  { path: 'assignments/:id', component: AssignmentDetailComponent },
  { path: 'assignments/:id/edit', loadComponent: () => import('./assignment-edit/assignment-edit.component').then(m => m.AssignmentEditComponent) },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TeacherModule { }
