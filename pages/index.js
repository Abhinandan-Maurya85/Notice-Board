import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="hero-page">
      {/* Background Overlay */}
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">📋 Notice Board Management System</h1>

        <p className="hero-subtitle">
          A centralized platform for Students and Faculty to access,
          manage, and publish important university notices efficiently.
        </p>

        {!user ? (
          <div className="hero-buttons">
            <Link href="/login">
              <button className="btn-primary">Login</button>
            </Link>

            <Link href="/signup">
              <button className="btn-secondary">Sign Up</button>
            </Link>
          </div>
        ) : (
          <div className="hero-buttons">
            <Link href="/notices">
              <button className="btn-primary">View Notices</button>
            </Link>
          </div>
        )}

        {/* Feature Grid */}
        <div className="feature-grid">
          <div className="feature-card">
            🎓
            <h3>Student Portal</h3>
            <p>Access university notices instantly.</p>
          </div>

          <div className="feature-card">
            👨‍🏫
            <h3>Faculty Portal</h3>
            <p>Create and manage official notices.</p>
          </div>

          <div className="feature-card">
            📢
            <h3>Notice Management</h3>
            <p>Organized and categorized announcements.</p>
          </div>

          <div className="feature-card">
            🔒
            <h3>Secure Access</h3>
            <p>Role-based authentication system.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
