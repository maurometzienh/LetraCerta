import { apiRequest } from './api';
import type { AuthResponse } from '../types/auth';

export function register(username: string, email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
