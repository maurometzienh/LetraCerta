const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';
const TOKEN_STORAGE_KEY = 'letracerta:token';
const USER_STORAGE_KEY = 'letracerta:user';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Token expirado/inválido numa chamada autenticada: desloga e manda pro login
    // em vez de deixar a tela num estado inconsistente.
    if (auth && response.status === 401 && !window.location.pathname.startsWith('/login')) {
      clearToken();
      localStorage.removeItem(USER_STORAGE_KEY);
      window.location.href = '/login';
    }

    const message = data?.message ?? 'Erro ao comunicar com o servidor.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}
