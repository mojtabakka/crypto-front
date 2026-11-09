import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { Button } from './Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import toast from 'react-hot-toast';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const PASSWORD_REQUIREMENTS = [
  {
    id: 'length',
    label: { fa: 'حداقل ۸ کاراکتر', en: 'At least 8 characters' },
    test: (p: string) => p.length >= 8,
  },
  {
    id: 'uppercase',
    label: { fa: 'یک حرف بزرگ', en: 'One uppercase letter' },
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: { fa: 'یک حرف کوچک', en: 'One lowercase letter' },
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    id: 'digit',
    label: { fa: 'یک عدد', en: 'One number' },
    test: (p: string) => /\d/.test(p),
  },
  {
    id: 'special',
    label: { fa: 'یک کاراکتر خاص', en: 'One special character' },
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

const STRINGS = {
  fa: {
    login: 'ورود',
    register: 'ثبت نام',
    username: 'نام کاربری',
    usernamePlaceholder: 'نام کاربری را انتخاب کنید',
    email: 'ایمیل',
    password: 'رمز عبور',
    confirmPassword: 'تایید رمز عبور',
    hidePassword: 'مخفی کردن رمز عبور',
    showPassword: 'نمایش رمز عبور',
    requirements: 'رموز عبور باید شامل موارد زیر باشد:',
    usernameRequired: 'نام کاربری الزامی است',
    usernameMin: 'حداقل ۳ نویسه',
    emailRequired: 'ایمیل الزامی است',
    emailInvalid: 'آدرس ایمیل نامعتبر است',
    passwordRequired: 'رمز عبور الزامی است',
    passwordWeak: 'رمز عبور شرایط زیر را ندارد',
    passwordsMismatch: 'رمز عبورها یکسان نیستند',
    registered: 'حساب کاربری با موفقیت ایجاد شد. لطفاً وارد شوید.',
    error: 'عملیات با خطا مواجه شد',
    processing: 'در حال پردازش...',
    createAccount: 'ساخت حساب',
    noAccount: 'حساب کاربری ندارید؟',
    haveAccount: 'حساب کاربری دارید؟',
  },
  en: {
    login: 'Sign in',
    register: 'Sign up',
    username: 'Username',
    usernamePlaceholder: 'Choose a username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
    requirements: 'Passwords must contain:',
    usernameRequired: 'Username is required',
    usernameMin: 'At least 3 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email address',
    passwordRequired: 'Password is required',
    passwordWeak: 'Password does not meet the requirements below',
    passwordsMismatch: 'Passwords do not match',
    registered: 'Account created successfully. Please sign in.',
    error: 'Something went wrong',
    processing: 'Processing...',
    createAccount: 'Create account',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
  },
} as const;

function PasswordStrength({ password, isRTL }: { password: string; isRTL: boolean }) {
  return (
    <div className="password-requirements">
      <span className="password-title">{STRINGS[isRTL ? 'fa' : 'en'].requirements}</span>
      <ul className="password-list">
        {PASSWORD_REQUIREMENTS.map((req) => (
          <li
            key={req.id}
            className={`req-item ${req.test(password) ? 'met' : 'unmet'}`}
          >
            {req.test(password) ? '✅' : '❌'} {req.label[isRTL ? 'fa' : 'en']}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const { isRTL } = useI18n();
  const S = STRINGS[isRTL ? 'fa' : 'en'];
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, setPasswordStrength] = useState<Record<string, boolean>>({});

  // Reset form when modal opens or mode changes — fixes "password always filled" bug
  useEffect(() => {
    setForm({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setFormError(null);
    setPasswordStrength({});
  }, [isOpen, mode]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const f = form;

    if (!f.username.trim()) newErrors.username = S.usernameRequired;
    else if (f.username.length < 3) newErrors.username = S.usernameMin;

    if (mode === 'register') {
      if (!f.email.trim()) newErrors.email = S.emailRequired;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        newErrors.email = S.emailInvalid;

      if (!f.password) newErrors.password = S.passwordRequired;
      else {
        const unmet = PASSWORD_REQUIREMENTS.filter((r) => !r.test(f.password));
        if (unmet.length > 0) {
          newErrors.password = S.passwordWeak;
        }
        if (f.password !== f.confirmPassword)
          newErrors.confirmPassword = S.passwordsMismatch;
      }
    } else {
      if (!f.password) newErrors.password = S.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, mode, S]);

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, password: e.target.value }));
      const strength: Record<string, boolean> = {};
      PASSWORD_REQUIREMENTS.forEach((r) => {
        strength[r.id] = r.test(e.target.value);
      });
      setPasswordStrength(strength);
    },
    [],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setFormError(null);
      if (!validateForm()) return;

      setSubmitting(true);
      try {
        if (mode === 'login') {
          await login({ username: form.username, password: form.password });
          onLoginSuccess?.();
        } else {
          await register({
            username: form.username,
            email: form.email,
            password: form.password,
          });
          toast.success(S.registered);
          setMode('login');
          setForm({ username: '', email: '', password: '', confirmPassword: '' });
        }
      } catch (err: any) {
        // Shown inline as well as in a toast: the toast alone was easy to miss.
        const message = err?.message || S.error;
        setFormError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [form, mode, login, register, validateForm, onLoginSuccess, submitting, S],
  );

  if (!isOpen) return null;

  const inputType = showPassword ? 'text' : 'password';
  const eyeIcon = showPassword ? '👁️' : '👁️‍🗨️';

  return (
    <div className="auth-modal-overlay" onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          minWidth: '400px',
          maxWidth: '500px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '32px 28px',
          color: '#f8fafc',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="auth-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>
            {mode === 'login' ? S.login : S.register}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginInlineStart: 'auto' }}>
            <LanguageSwitcher />
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '24px',
              lineHeight: 1,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
            {S.username}
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder={S.usernamePlaceholder}
            className={errors.username ? 'auth-input error' : 'auth-input'}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: errors.username ? '1px solid #ef4444' : '1px solid #334155',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '14px',
              boxSizing: 'border-box',
              direction: 'ltr',
            }}
          />
          {errors.username && (
            <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '4px', display: 'block' }}>
              {errors.username}
            </span>
          )}

          {mode === 'register' && (
            <>
              <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                {S.email}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={errors.email ? 'auth-input error' : 'auth-input'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.email ? '1px solid #ef4444' : '1px solid #334155',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  direction: 'ltr',
                }}
              />
              {errors.email && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '4px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </>
          )}

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
              {S.password}
            </label>
            <input
              type={inputType}
              value={form.password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className={errors.password ? 'auth-input error' : 'auth-input'}
              style={{
                width: '100%',
                padding: '10px 40px 10px 14px',
                borderRadius: '8px',
                border: errors.password ? '1px solid #ef4444' : '1px solid #334155',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '14px',
                boxSizing: 'border-box',
                direction: 'ltr',
              }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '12px',
                top: '36px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                padding: 0,
                lineHeight: 1,
              }}
              title={showPassword ? S.hidePassword : S.showPassword}
            >
              {eyeIcon}
            </button>
            {errors.password && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {mode === 'register' && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              <PasswordStrength password={form.password} isRTL={isRTL} />
              <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block', marginTop: '6px' }}>
                {S.confirmPassword}
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'auth-input error' : 'auth-input'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #334155',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  direction: 'ltr',
                }}
              />
              {errors.confirmPassword && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '4px', display: 'block' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {formError && (
            <div
              role="alert"
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.55)',
                color: '#fecaca',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                lineHeight: 1.7,
              }}
            >
              {formError}
            </div>
          )}

          <Button
            type="submit"
            variant="purple"
            size="md"
            disabled={isLoading || submitting}
            style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600 }}
          >
            {isLoading || submitting
              ? S.processing
              : mode === 'login'
                ? S.login
                : S.createAccount}
          </Button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {mode === 'login' ? S.noAccount : S.haveAccount}
          </span>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            {mode === 'login' ? S.register : S.login}
          </button>
        </div>
      </div>
    </div>
  );
}