import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/notices', label: 'All Notices' },
    { href: '/about',   label: 'About Us'    },
  ]

  const isFaculty = user?.role === 'FACULTY'

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <span className="brand-icon">📋</span>
          <span className="brand-name">NoticeBoard</span>
        </Link>

        {/* Desktop  */}
        <div className="nav-links">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${router.pathname === href ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
          
          {isFaculty && (
            <Link href="/notices/create" className="nav-btn">
              + Post Notice
            </Link>
          )}

          {user ? (
            <div className="nav-user-section">
              <span className="nav-user-info">
                Hi, <strong>{user.name}</strong> 
                <span className="nav-role-badge">{user.role === 'FACULTY' ? 'Faculty' : 'Student'}</span>
              </span>
              <button onClick={logout} className="nav-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="nav-signup-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger — only visible on mobile via CSS */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`mobile-link ${router.pathname === href ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          
          {isFaculty && (
            <Link
              href="/notices/create"
              className="mobile-nav-btn"
              onClick={() => setMenuOpen(false)}
            >
              + Post Notice
            </Link>
          )}

          {user ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <strong>{user.name}</strong>
                <span className="nav-role-badge">{user.role === 'FACULTY' ? 'Faculty' : 'Student'}</span>
              </div>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="mobile-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link href="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/signup" className="mobile-nav-btn" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}