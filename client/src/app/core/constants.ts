// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    },
    TEACHER: {
      DASHBOARD: '/teacher/dashboard',
      PROFILE: '/teacher/profile',
      ASSIGNMENTS: '/teacher/assignments'
    },
    STUDENT: {
      DASHBOARD: '/student/dashboard',
      PROFILE: '/student/profile',
      ASSIGNMENTS: '/assignment/student/dashboard'
    },
    ASSIGNMENT: {
      CREATE: '/assignment',
      GET_ALL: '/assignment',
      GET_BY_ID: (id: string) => `/assignment/${id}`,
      UPDATE: (id: string) => `/assignment/updateQ/${id}`,
      DELETE: (id: string) => `/assignment/${id}`,
      SUBMIT: (id: string) => `/assignment/updateA/${id}`,
      SUBMISSIONS: (id: string) => `/assignment/${id}/submissions`
    }
  }
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']
};

// UI Configuration
export const UI_CONFIG = {
  NOTIFICATION_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  }
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (field: string, length: number) => `${field} must be at least ${length} characters`,
  MAX_LENGTH: (field: string, length: number) => `${field} must not exceed ${length} characters`,
  FILE_SIZE: (maxSize: number) => `File size must be less than ${maxSize / (1024 * 1024)}MB`,
  FILE_TYPE: 'Please select a valid file type'
};

// Status Types
export const STATUS_TYPES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  ACTIVE: 'active'
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher'
} as const; 