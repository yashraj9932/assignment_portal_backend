import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  teacher: string;
  questions?: Array<{
    text: string;
    type?: string;
    points?: number;
    options?: string[];
  }>;
  answers?: string[];
  status?: string;
  createdAt?: string;
  assignmentSubmitted?: Submission[];
  isSubmitted?: boolean;
  isInAssignmentsLeft?: boolean;
  completionStatus?: 'pending' | 'completed' | 'overdue';
  submittedAt?: string | null;
}

export interface Submission {
  student: string;
  studentName?: string;
  answerpdf: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  assignmentTitle?: string;
  status?: string;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  assignmentsLeft: string[];
  createdAt?: string | Date;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
  subject?: string;
  bio?: string;
  createdAt?: string | Date;
}

export interface TeacherDashboard {
  totalAssignments: number;
  totalStudents: number;
  recentAssignments: Assignment[];
  recentSubmissions: Submission[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Teacher Dashboard
  getTeacherDashboard(): Observable<TeacherDashboard> {
    return this.http.get<any>(`${this.apiUrl}/teacher/dashboard`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.msg) {
            return response.msg;
          } else if (response.data) {
            return response.data;
          }
          return response;
        })
      );
  }

  // Teacher Profile
  getTeacherProfile(): Observable<Teacher> {
    return this.http.get<any>(`${this.apiUrl}/teacher/profile`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.msg) {
            return response.msg;
          } else if (response.data) {
            return response.data;
          }
          return response;
        })
      );
  }

  updateTeacherProfile(profileData: Partial<Teacher>): Observable<Teacher> {
    return this.http.put<any>(`${this.apiUrl}/teacher/profile`, profileData, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.msg) {
            return response.msg;
          } else if (response.data) {
            return response.data;
          }
          return response;
        })
      );
  }

  // Teacher Assignments
  getTeacherAssignments(): Observable<Assignment[]> {
    return this.http.get<any>(`${this.apiUrl}/teacher/assignments`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        })
      );
  }

  createAssignment(assignmentData: Partial<Assignment>): Observable<Assignment> {
    return this.http.post<any>(`${this.apiUrl}/assignment`, assignmentData, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        }),
        catchError(error => {
          let errorMessage = 'Failed to create assignment';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 400) {
            errorMessage = 'Invalid assignment data. Please check all required fields.';
          } else if (error.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.status === 403) {
            errorMessage = 'You are not authorized to create assignments.';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  updateAssignment(id: string, assignmentData: Partial<Assignment>): Observable<Assignment> {
    return this.http.put<any>(`${this.apiUrl}/assignment/updateQ/${id}`, assignmentData, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        })
      );
  }

  // Student Dashboard
  getStudentDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/dashboard`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.msg) {
            return response.msg;
          } else if (response.data) {
            return response.data;
          }
          return response;
        })
      );
  }

  // Student Profile
  getStudentProfile(): Observable<Student> {
    return this.http.get<any>(`${this.apiUrl}/student/profile`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.msg) {
            return response.msg;
          } else if (response.data) {
            return response.data;
          }
          return response;
        })
      );
  }

  updateStudentProfile(profileData: Partial<Student>): Observable<Student> {
    return this.http.put<any>(`${this.apiUrl}/student/profile`, profileData, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.msg) {
            return response.msg;
          } else if (response.data) {
            return response.data;
          }
          return response;
        })
      );
  }

  // Assignments
  getAssignments(): Observable<Assignment[]> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    
    const headers = this.getHeaders();
    
    return this.http.get<any>(`${this.apiUrl}/assignment`, { headers })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        }),
        catchError(error => {
          throw error;
        })
      );
  }

  // Student assignments with submission status
  getStudentAssignments(): Observable<Assignment[]> {
    return this.http.get<any>(`${this.apiUrl}/assignment/student/dashboard`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        })
      );
  }

  getAssignment(id: string): Observable<Assignment> {
    return this.http.get<any>(`${this.apiUrl}/assignment/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        })
      );
  }

  submitAssignmentFile(id: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.put(`${this.apiUrl}/assignment/updateA/${id}`, formData, { headers });
  }

  getAssignmentSubmissions(assignmentId: string): Observable<Submission[]> {
    return this.http.get<any>(`${this.apiUrl}/assignment/${assignmentId}/submissions`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        })
      );
  }

  deleteAssignment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/assignment/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Handle both response structures
          if (response.data) {
            return response.data;
          } else if (response.msg) {
            return response.msg;
          }
          return response;
        })
      );
  }
}
