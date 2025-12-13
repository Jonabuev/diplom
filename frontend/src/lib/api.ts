import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string, phone?: string) =>
    api.post('/auth/register', { username, email, password, phone }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
  addBookToList: (userId: string, bookId: string) =>
    api.post(`/users/${userId}/books/${bookId}`),
  removeBookFromList: (userId: string, bookId: string) =>
    api.delete(`/users/${userId}/books/${bookId}`),
};

// Books API
export const booksAPI = {
  getAll: () => api.get('/books'),
  getPublic: () => api.get('/books/public'),
  getOne: (id: string) => api.get(`/books/${id}`),
  getByCategory: (category: string) => api.get(`/books/category/${category}`),
  create: (data: any) => api.post('/books', data),
  update: (id: string, data: any) => api.patch(`/books/${id}`, data),
  delete: (id: string) => api.delete(`/books/${id}`),
  addChapter: (bookId: string, data: any) =>
    api.post(`/books/${bookId}/chapters`, data),
  updateChapter: (bookId: string, chapterId: string, data: any) =>
    api.patch(`/books/${bookId}/chapters/${chapterId}`, data),
  deleteChapter: (bookId: string, chapterId: string) =>
    api.delete(`/books/${bookId}/chapters/${chapterId}`),
  togglePublic: (id: string) => api.patch(`/books/${id}/toggle-public`),
};

// Questions API
export const questionsAPI = {
  getAll: () => api.get('/questions'),
  getByBook: (bookId: string) => api.get(`/questions/book/${bookId}`),
  getByChapter: (chapterId: string) => api.get(`/questions/chapter/${chapterId}`),
  generate: (chapterId: string, bookId: string, count?: number) =>
    api.post(`/questions/generate?count=${count || 5}`, { chapterId, bookId }),
  create: (data: any) => api.post('/questions', data),
  update: (id: string, data: any) => api.patch(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
};

// History API
export const historyAPI = {
  getMy: () => api.get('/history/my'),
  getStatistics: (bookId?: string) =>
    api.get(`/history/statistics${bookId ? `?bookId=${bookId}` : ''}`),
  addAnswer: (bookId: string, questionId: string, userAnswer: string, isCorrect: boolean) =>
    api.post('/history/answer', { bookId, questionId, userAnswer, isCorrect }),
};

// Notifications API
export const notificationsAPI = {
  getMy: () => api.get('/notifications/my'),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all'),
};

