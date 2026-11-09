import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import authAPI from '../auth/api';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import toast from 'react-hot-toast';

interface UserRow {
  id: number;
  username: string;
  email: string | null;
  role: 'admin' | 'user';
  session_timeout_minutes: number;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

const MIN_SESSION_MINUTES = 5;
const MAX_SESSION_MINUTES = 525_600; // 1 year

const STRINGS = {
  fa: {
    pageTitle: '👥 مدیریت کاربران',
    pageSubtitle: 'تغییر نام کاربری، رمز عبور، وضعیت و مهلت جلسه',
    loadingUsers: 'در حال بارگذاری کاربران...',
    signedInAs: 'وارد شده به عنوان',
    dashboard: '← داشبورد',
    signOut: 'خروج از سیستم',
    colUsername: 'نام کاربری',
    colEmail: 'ایمیل',
    colRole: 'نقش',
    colStatus: 'وضعیت',
    colSession: 'مهلت جلسه',
    colLastLogin: 'آخرین ورود',
    colActions: 'عملیات',
    you: '(شما)',
    roleAdmin: '🛡️ مدیر',
    roleUser: '👤 کاربر',
    active: '✅ فعال',
    inactive: '❌ غیرفعال',
    never: 'هرگز',
    edit: '✏️ ویرایش',
    delete: '🗑️ حذف',
    editTitle: 'ویرایش',
    usernameLabel: 'نام کاربری',
    usernameHint: 'پس از تغییر، کاربر باید با نام کاربری جدید وارد شود.',
    emailLabel: 'ایمیل',
    passwordLabel: 'رمز عبور جدید (اختیاری)',
    passwordPlaceholder: 'خالی بگذارید تا رمز فعلی حفظ شود',
    passwordHint: 'حداقل ۸ کاراکتر، شامل حرف بزرگ، حرف کوچک و عدد یا علامت.',
    statusLabel: 'وضعیت',
    selfDeactivateHint: 'حساب خودتان را نمی‌توانید غیرفعال کنید.',
    sessionTitle: 'مهلت جلسه',
    hours: 'ساعت',
    minutes: 'دقیقه',
    sessionHint: 'مدت اعتبار نشست کاربر:',
    saving: 'در حال ذخیره...',
    save: 'ذخیره تغییرات',
    cancel: 'لغو',
    errLoad: 'بارگذاری کاربران با خطا مواجه شد',
    errMinutes: 'دقیقه باید بین 0 تا 59 باشد',
    errMinSession: 'مهلت جلسه نمی‌تواند کمتر از ۵ دقیقه باشد',
    errMaxSession: 'مهلت جلسه نمی‌تواند بیشتر از یک سال باشد',
    errUsername: 'نام کاربری نمی‌تواند خالی باشد',
    okSave: 'تغییرات با موفقیت ذخیره شد',
    errSave: 'ذخیره تغییرات با خطا مواجه شد',
    confirmDelete: 'آیا از حذف این کاربر اطمینان دارید؟',
    okDelete: 'کاربر با موفقیت حذف شد',
    errDelete: 'حذف کاربر با خطا مواجه شد',
  },
  en: {
    pageTitle: '👥 User Management',
    pageSubtitle: 'Change usernames, passwords, status and session expiry',
    loadingUsers: 'Loading users...',
    signedInAs: 'Signed in as',
    dashboard: '← Dashboard',
    signOut: 'Sign out',
    colUsername: 'Username',
    colEmail: 'Email',
    colRole: 'Role',
    colStatus: 'Status',
    colSession: 'Session expiry',
    colLastLogin: 'Last login',
    colActions: 'Actions',
    you: '(you)',
    roleAdmin: '🛡️ Admin',
    roleUser: '👤 User',
    active: '✅ Active',
    inactive: '❌ Inactive',
    never: 'Never',
    edit: '✏️ Edit',
    delete: '🗑️ Delete',
    editTitle: 'Edit',
    usernameLabel: 'Username',
    usernameHint: 'After the change the user must sign in with the new username.',
    emailLabel: 'Email',
    passwordLabel: 'New password (optional)',
    passwordPlaceholder: 'Leave empty to keep the current password',
    passwordHint: 'At least 8 characters, one uppercase, one lowercase and a number or symbol.',
    statusLabel: 'Status',
    selfDeactivateHint: 'You cannot deactivate your own account.',
    sessionTitle: 'Session expiry',
    hours: 'Hours',
    minutes: 'Minutes',
    sessionHint: 'This session stays valid for:',
    saving: 'Saving...',
    save: 'Save changes',
    cancel: 'Cancel',
    errLoad: 'Failed to load users',
    errMinutes: 'Minutes must be between 0 and 59',
    errMinSession: 'Session expiry cannot be shorter than 5 minutes',
    errMaxSession: 'Session expiry cannot be longer than one year',
    errUsername: 'Username cannot be empty',
    okSave: 'Changes saved successfully',
    errSave: 'Failed to save changes',
    confirmDelete: 'Are you sure you want to delete this user?',
    okDelete: 'User deleted successfully',
    errDelete: 'Failed to delete user',
  },
} as const;

/** 90 → "1 ساعت و 30 دقیقه" / "1h 30m" */
function formatSession(minutes: number, isRTL: boolean): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!isRTL) {
    if (h <= 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  if (h <= 0) return `${m} دقیقه`;
  if (m === 0) return `${h} ساعت`;
  return `${h} ساعت و ${m} دقیقه`;
}

export function UserManagementPage() {
  const { isRTL, locale } = useI18n();
  const L = STRINGS[isRTL ? 'fa' : 'en'];
  const dateLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
  const { user, logout, checkSession } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    is_active: true,
    password: '',
  });
  const [sessionForm, setSessionForm] = useState({ hours: 1, minutes: 0 });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authAPI.listUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err?.message || STRINGS[isRTL ? 'fa' : 'en'].errLoad);
    } finally {
      setIsLoading(false);
    }
  }, [isRTL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const editingUser = users.find((u) => u.id === editing) ?? null;
  const editingSelf = !!editingUser && editingUser.id === user?.id;

  const openEdit = (u: UserRow) => {
    setEditForm({
      username: u.username,
      email: u.email ?? '',
      is_active: u.is_active,
      password: '',
    });
    setSessionForm({
      hours: Math.floor(u.session_timeout_minutes / 60),
      minutes: u.session_timeout_minutes % 60,
    });
    setEditing(u.id);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm({ username: '', email: '', is_active: true, password: '' });
    setSessionForm({ hours: 1, minutes: 0 });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || isSaving) return;

    const totalMinutes =
      Math.max(0, Math.floor(sessionForm.hours) || 0) * 60 +
      (Math.floor(sessionForm.minutes) || 0);

    if (sessionForm.minutes < 0 || sessionForm.minutes > 59) {
      toast.error(L.errMinutes);
      return;
    }
    if (totalMinutes < MIN_SESSION_MINUTES) {
      toast.error(L.errMinSession);
      return;
    }
    if (totalMinutes > MAX_SESSION_MINUTES) {
      toast.error(L.errMaxSession);
      return;
    }
    if (!editForm.username.trim()) {
      toast.error(L.errUsername);
      return;
    }

    setIsSaving(true);
    try {
      await authAPI.updateUser(editingUser.id, {
        username: editForm.username.trim(),
        ...(editForm.email.trim() ? { email: editForm.email.trim() } : {}),
        is_active: editForm.is_active,
        ...(editForm.password ? { password: editForm.password } : {}),
      });

      if (totalMinutes !== editingUser.session_timeout_minutes) {
        await authAPI.setSessionTimeout(editingUser.id, totalMinutes);
      }

      toast.success(L.okSave);

      // Editing yourself changes the session data behind the header, so pull
      // a fresh profile before closing the panel.
      if (editingSelf) {
        await checkSession().catch(() => undefined);
      }

      closeEdit();
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || L.errSave);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(L.confirmDelete)) return;
    try {
      await authAPI.deleteUser(id);
      toast.success(L.okDelete);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || L.errDelete);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div style={{ color: '#94a3b8' }}>{L.loadingUsers}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>{L.pageTitle}</h1>
          <p style={{ color: '#94a3b8' }}>{L.pageSubtitle}</p>
        </div>
        <div className="admin-actions">
          <LanguageSwitcher />
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>
            {L.signedInAs} <strong>{user?.username}</strong> (
            {user?.role === 'admin' ? (isRTL ? 'مدیر' : 'admin') : isRTL ? 'کاربر' : 'user'})
          </span>
          <Button variant="ghost" size="sm" onClick={() => { window.location.href = '/'; }}>
            {L.dashboard}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            {L.signOut}
          </Button>
        </div>
      </div>

      <div className="admin-content">
        <div>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{L.colUsername}</th>
                  <th>{L.colEmail}</th>
                  <th>{L.colRole}</th>
                  <th>{L.colStatus}</th>
                  <th>{L.colSession}</th>
                  <th>{L.colLastLogin}</th>
                  <th>{L.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="user-row">
                    <td>
                      {u.username}
                      {u.id === user?.id && (
                        <span style={{ color: '#64748b', fontSize: '11px', marginInlineStart: '6px' }}>
                          {L.you}
                        </span>
                      )}
                    </td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                        {u.role === 'admin' ? L.roleAdmin : L.roleUser}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                        {u.is_active ? L.active : L.inactive}
                      </span>
                    </td>
                    <td>{formatSession(u.session_timeout_minutes, isRTL)}</td>
                    <td>
                      {u.last_login
                        ? new Date(u.last_login).toLocaleString(dateLocale)
                        : L.never}
                    </td>
                    <td className="actions-cell">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                        {L.edit}
                      </Button>
                      {u.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                          style={{ color: '#ef4444' }}
                        >
                          {L.delete}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingUser && (
          <div className="edit-panel">
            <h3>
              {L.editTitle} «{editingUser.username}»
              {editingUser.role === 'admin' && ' 🛡️'}
            </h3>

            <form onSubmit={handleSave} className="edit-form">
              <div className="form-field">
                <label>{L.usernameLabel}</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                  minLength={3}
                  maxLength={50}
                />
                <span className="form-hint">{L.usernameHint}</span>
              </div>

              <div className="form-field">
                <label>{L.emailLabel}</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>{L.passwordLabel}</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder={L.passwordPlaceholder}
                  autoComplete="new-password"
                />
                <span className="form-hint">{L.passwordHint}</span>
              </div>

              <div className="form-field">
                <label>{L.statusLabel}</label>
                <select
                  value={String(editForm.is_active)}
                  disabled={editingSelf}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.value === 'true' })
                  }
                >
                  <option value="true">{isRTL ? 'فعال' : 'Active'}</option>
                  <option value="false">{isRTL ? 'غیرفعال' : 'Inactive'}</option>
                </select>
                {editingSelf && <span className="form-hint">{L.selfDeactivateHint}</span>}
              </div>

              <div className="timeout-section">
                <h4>{L.sessionTitle}</h4>
                <div className="session-inputs">
                  <div className="form-field">
                    <label>{L.hours}</label>
                    <input
                      type="number"
                      min={0}
                      max={8760}
                      value={sessionForm.hours}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          hours: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>{L.minutes}</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={sessionForm.minutes}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          minutes: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                        })
                      }
                    />
                  </div>
                </div>
                <span className="form-hint">
                  {L.sessionHint} {formatSession(sessionForm.hours * 60 + sessionForm.minutes, isRTL)}
                </span>
              </div>

              <div className="form-actions">
                <Button type="submit" variant="purple" size="md">
                  {isSaving ? L.saving : L.save}
                </Button>
                <Button variant="ghost" size="md" onClick={closeEdit}>
                  {L.cancel}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
