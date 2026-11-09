const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Error copy follows the UI language the user picked. */
function msg(fa: string, en: string): string {
  return localStorage.getItem('locale') === 'en' ? en : fa;
}

export interface RegisterDto {
  username: string;
  email?: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface LoginDto {
  username: string;
  password: string;
}

async function request(
  path: string,
  options: RequestInit = {},
): Promise<any> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    // Backend down / wrong host / CORS — without this the user only saw
    // "Failed to fetch", which explains nothing.
    throw new Error(
      msg(
        'اتصال به سرور برقرار نشد. مطمئن شوید بک‌اند روی پورت 3000 در حال اجراست.',
        'Could not reach the server. Make sure the backend is running on port 3000.',
      ),
    );
  }

  if (response.status === 401) {
    // Token expired or invalid — clear and signal auth failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    const body = await response.json().catch(() => null);
    // The server sends the real reason (bad credentials vs expired session).
    const serverMessage: string | undefined = body?.message;
    const invalid = msg('نام کاربری یا رمز عبور اشتباه است', 'Invalid username or password');
    throw new Error(serverMessage === 'Invalid credentials' ? invalid : serverMessage || invalid);
  }

  if (response.status === 429) {
    throw new Error(
      msg(
        'تلاش‌های زیاد. لطفاً کمی بعد دوباره امتحان کنید.',
        'Too many requests. Please try again later.',
      ),
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}

export const authAPI = {
  register: (data: RegisterDto) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginDto) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: (refreshToken: string) =>
    request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken?: string) =>
    request('/auth/logout', {
      method: 'POST',
      body: refreshToken ? JSON.stringify({ refresh_token: refreshToken }) : undefined,
    }),

  me: () => request('/auth/me'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  listUsers: () => request('/auth/admin/users'),

  updateUser: (id: number, data: {
    username?: string;
    email?: string;
    role?: 'admin' | 'user';
    is_active?: boolean;
    password?: string;
  }) =>
    request(`/auth/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  setSessionTimeout: (id: number, session_timeout_minutes: number) =>
    request(`/auth/admin/users/${id}/session-timeout`, {
      method: 'PATCH',
      body: JSON.stringify({ session_timeout_minutes }),
    }),

  deleteUser: (id: number) =>
    request(`/auth/admin/users/${id}`, { method: 'DELETE' }),
};

export default authAPI;
