import { useState } from 'react';
import { LoginModal } from '../components/LoginModal';

export function SignUpPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        <div className="auth-page-card">
          <div className="auth-page-header">
            <div className="auth-page-icon">📝</div>
            <h1>Create Account</h1>
            <p>Join Crypto Volume and start analyzing the market</p>
          </div>

          <LoginModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onLoginSuccess={() => {
              setIsOpen(false);
              window.location.href = '/';
            }}
          />
        </div>
      </div>
    </div>
  );
}
