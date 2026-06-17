import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const router = useRouter();
  const { user, loading, signup } = useAuth();
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync role with query parameter if present on mount
  useEffect(() => {
    if (router.query.role === 'FACULTY' || router.query.role === 'STUDENT') {
      setRole(router.query.role);
    }
  }, [router.query]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/notices');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const res = await signup(name, email, password, role);
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
        <title>Sign Up — Notice Board</title>
        <meta name="description" content="Register to official campus notice board" />
      </Head>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">📋</span>
            <h1>Create Account</h1>
            <p className="auth-subtitle">Select your role to sign up</p>
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
              🎓 Student Portal
            </button>
            <button
              type="button"
              className={`portal-btn ${role === 'FACULTY' ? 'active' : ''}`}
              onClick={() => {
                setRole('FACULTY');
                setError('');
              }}
            >
              🔒 Faculty Portal
            </button>
            <div className={`portal-slider ${role === 'FACULTY' ? 'slide-right' : ''}`} />
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth-input"
              />
            </div>

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

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={submitting}>
              {submitting ? 'Registering...' : `Sign Up as ${role === 'STUDENT' ? 'Student' : 'Faculty'}`}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link href={`/login?role=${role}`} className="auth-link">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
