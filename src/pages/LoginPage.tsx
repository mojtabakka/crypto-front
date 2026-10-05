import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button } from '../components/Button';
import './AuthPages.css';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch {
      // Do not surface the server wording; keep it localized and simple.
      setError(t.auth.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-lang">
        <LanguageSwitcher />
      </div>

      <div className="auth-container">
        <h1 className="auth-title">{t.auth.loginTitle}</h1>
        <p className="auth-subtitle">{t.auth.loginSubtitle}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="username">{t.auth.username}</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.auth.usernamePlaceholder}
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">{t.auth.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? t.auth.submitting : t.auth.submit}
          </Button>
        </form>
      </div>
    </div>
  );
}