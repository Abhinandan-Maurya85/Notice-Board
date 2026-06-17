import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [role, setRole] = useState('STUDENT'); // STUDENT or FACULTY
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/notices');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password, role);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error);
    } else {
      router.push('/notices');
    }
  };

  if (loading || user) {
    return (
      <div className="auth-loading-container">
        <div className="spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login — Notice Board</title>
        <meta name="description" content="Login to official campus notice board" />
      </Head>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">📋</span>
            <h1>Welcome to NoticeBoard</h1>
            <p className="auth-subtitle">Please select your portal to log in</p>
          </div>

          {/* DUAL PORTAL SWITCHER */}
          <div className="portal-switcher">
            <button
              type="button"
              className={`portal-btn ${role === 'STUDENT' ? 'active' : ''}`}
              onClick={() => {
                setRole('STUDENT');
                setError('');
              }}
            >
              🎓 Student Login
            </button>
            <button
              type="button"
              className={`portal-btn ${role === 'FACULTY' ? 'active' : ''}`}
              onClick={() => {
                setRole('FACULTY');
                setError('');
              }}
            >
              🔒 Faculty Login
            </button>
            <div className={`portal-slider ${role === 'FACULTY' ? 'slide-right' : ''}`} />
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder={role === 'STUDENT' ? 'student@institution.edu' : 'faculty@institution.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={submitting}>
              {submitting ? 'Signing in...' : `Sign In as ${role === 'STUDENT' ? 'Student' : 'Faculty'}`}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link href={`/signup?role=${role}`} className="auth-link">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
