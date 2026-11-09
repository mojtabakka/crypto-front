import { LoginModal } from '../components/LoginModal';

export function LoginPage() {
  // The modal renders its own full-screen dark panel, so wrapping it in the
  // .auth-page card only produced content hidden behind the blur.
  return (
    <div className="auth-page">
      <LoginModal
        isOpen={true}
        onClose={() => {
          window.location.href = '/';
        }}
        onLoginSuccess={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}
