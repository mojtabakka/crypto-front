import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import './AdminUsersPage.css';

const API_BASE = 'http://localhost:3000';

interface ManagedUser {
  username: string;
  role: string | null;
}

export function AdminUsersPage({ onBack }: { onBack: () => void }) {
  const { token, user: currentUser } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [resetTarget, setResetTarget] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const flash = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch users');
      return (await res.json()) as ManagedUser[];
    },
    enabled: !!token,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = Array.isArray(err.message)
          ? err.message[0]
          : err.message;
        throw new Error(message || 'Failed');
      }

      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowCreateForm(false);
      setUsername('');
      setPassword('');
      setRole('user');
      flash(t.admin.created);
    },
    onError: (err: Error) => {
      setError(
        err.message.toLowerCase().includes('already exists')
          ? t.admin.duplicateUsername
          : t.error.generic,
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: async ({ target, value }: { target: string; value: string }) => {
      const res = await fetch(
        `${API_BASE}/admin/users/${encodeURIComponent(target)}/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ newPassword: value }),
        },
      );

      if (!res.ok) throw new Error('Failed to reset password');
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setResetTarget(null);
      setNewPassword('');
      flash(t.admin.passwordReset);
    },
    onError: () => setError(t.error.generic),
  });

  const deleteMutation = useMutation({
    mutationFn: async (target: string) => {
      const res = await fetch(
        `${API_BASE}/admin/users/${encodeURIComponent(target)}`,
        { method: 'DELETE', headers: authHeaders },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = Array.isArray(err.message) ? err.message[0] : err.message;
        throw new Error(message || 'Failed');
      }

      return res.json();
    },
    onSuccess: () => {
      invalidate();
      flash(t.admin.deleted);
    },
    onError: (err: Error) => {
      setError(
        err.message.toLowerCase().includes('yourself') ? t.admin.deleteSelf : t.error.generic,
      );
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError(t.admin.usernameRequired);
      return;
    }

    createMutation.mutate({ username, password, role });
  };

  const handleReset = (e: React.FormEvent, target: string) => {
    e.preventDefault();

    if (!newPassword) {
      setError(t.admin.passwordRequired);
      return;
    }

    resetMutation.mutate({ target, value: newPassword });
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="admin-users-page">
        <div className="access-denied">
          <h1>{t.admin.accessDenied}</h1>
          <p>{t.admin.accessDeniedHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-header">
        <div className="admin-title-row">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t.controls.back}
          </Button>
          <h1>{t.admin.title}</h1>
        </div>

        <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? t.admin.cancel : t.admin.createUser}
        </Button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {showCreateForm && (
        <form onSubmit={handleCreate} className="admin-form">
          <div className="form-row">
            <div className="form-field">
              <label>{t.admin.username}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.admin.usernamePlaceholder}
                required
              />
            </div>

            <div className="form-field">
              <label>{t.admin.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.admin.passwordPlaceholder}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t.admin.role}</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">{t.admin.roleUser}</option>
                <option value="admin">{t.admin.roleAdmin}</option>
              </select>
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? t.admin.submitting : t.admin.submit}
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="admin-loading">{t.admin.loading}</div>
      ) : users && users.length > 0 ? (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t.admin.username}</th>
                <th>{t.admin.role}</th>
                <th>{t.admin.actions}</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.username}>
                  <td>{user.username}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? t.admin.roleAdmin : t.admin.roleUser}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setResetTarget(resetTarget === user.username ? null : user.username);
                          setNewPassword('');
                          setError('');
                        }}
                      >
                        {t.admin.resetPassword}
                      </Button>

                      {currentUser.username !== user.username && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const message = t.admin.deleteConfirm.replace(
                              '{username}',
                              user.username,
                            );
                            if (window.confirm(message)) {
                              deleteMutation.mutate(user.username);
                            }
                          }}
                        >
                          {t.alerts.deleteAlert}
                        </Button>
                      )}
                    </div>

                    {resetTarget === user.username && (
                      <form
                        onSubmit={(e) => handleReset(e, user.username)}
                        className="reset-form"
                      >
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t.admin.newPassword}
                          required
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={resetMutation.isPending}
                        >
                          {resetMutation.isPending ? t.admin.resetting : t.admin.confirm}
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty">
          <p>{t.admin.empty}</p>
        </div>
      )}
    </div>
  );
}