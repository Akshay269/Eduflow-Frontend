export type Role = "STUDENT" | "INSTRUCTOR";
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  level: Level;
  averageRating: number;
  totalReviews: number;
  thumbnailUrl?: string;
  published: boolean;
  instructorName: string;
  createdAt: string;
}

export interface Review {
  id: number;
  courseId: number;
  studentId: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: number;
  courseId: number;
  studentId: number;
  enrolledAt: string;
  courseName: string;
  instructorName: string;
  thumbnailUrl?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
