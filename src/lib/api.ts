const BASE_URL = "https://d35qzhxh4jwgyd.cloudfront.net";

let token: string | null = null;

export const setToken = (t: string | null) => { token = t; };
export const getToken = () => token;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (res.status === 403) {
    throw new Error("Access Denied");
  }

  if (!res.ok) {
    const err = await res.text().catch(() => "Request failed");
    throw new Error(err);
  }

  // handle empty responses
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

// Auth
export const auth = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  googleUrl: () => `${BASE_URL}/oauth2/authorization/google`,
};

// Courses
export const courses = {
  list: (page = 0, size = 10, sortBy = "createdAt") =>
    request<any>(`/api/courses?page=${page}&size=${size}&sortBy=${sortBy}`),
  get: (id: number) => request<any>(`/api/courses/${id}`),
  search: (params: { keyword?: string; category?: string; level?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params.keyword) q.set("keyword", params.keyword);
    if (params.category) q.set("category", params.category);
    if (params.level) q.set("level", params.level);
    q.set("page", String(params.page ?? 0));
    q.set("size", String(params.size ?? 10));
    return request<any>(`/api/courses/search?${q.toString()}`);
  },
  create: (data: any) => request<any>("/api/courses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/api/courses/${id}`, { method: "DELETE" }),
  uploadThumbnail: (id: number, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return request<any>(`/api/courses/${id}/thumbnail`, { method: "POST", body: fd });
  },
  myCourses: () => request<any>("/api/courses/my-courses"),
};

// Enrollments
export const enrollments = {
  enroll: (courseId: number) => request<any>(`/api/enrollments/course/${courseId}`, { method: "POST" }),
  myEnrollments: () => request<any>("/api/enrollments/my-enrollments"),
  check: (courseId: number) => request<boolean>(`/api/enrollments/check/${courseId}`),
  students: (courseId: number) => request<any>(`/api/enrollments/course/${courseId}/students`),
};

// Reviews
export const reviews = {
  list: (courseId: number, page = 0, size = 10) =>
    request<any>(`/api/reviews/course/${courseId}?page=${page}&size=${size}`),
  create: (courseId: number, data: { rating: number; comment: string }) =>
    request<any>(`/api/reviews/course/${courseId}`, { method: "POST", body: JSON.stringify(data) }),
  update: (reviewId: number, data: { rating: number; comment: string }) =>
    request<any>(`/api/reviews/${reviewId}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (reviewId: number) => request<any>(`/api/reviews/${reviewId}`, { method: "DELETE" }),
  myReview: (courseId: number) => request<any>(`/api/reviews/course/${courseId}/my-review`),
};

// Users
export const users = {
  profile: () => request<any>("/api/users/profile"),
  updateProfile: (data: { name: string; bio: string }) =>
    request<any>("/api/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  uploadPicture: (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return request<any>("/api/users/profile/picture", { method: "POST", body: fd });
  },
};
