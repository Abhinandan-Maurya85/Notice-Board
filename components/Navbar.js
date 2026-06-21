import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  const links = [
    { href: '/notices', label: 'All Notices' },
    { href: '/about', label: 'About Us' },
  ]

  const isFaculty = user?.role === 'FACULTY'
  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    if (!user) return // don't poll when logged out

    loadNotifications()
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleNotificationClick = async (n) => {
    setShowNotifications(false)

    if (n.noticeId) {
      router.push(`/notices/${n.noticeId}`)
    }

    if (n.isRead) return

    setNotifications((prev) =>
      prev.map((notif) => (notif.id === n.id ? { ...notif, isRead: true } : notif))
    )

    try {
      await fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <span className="brand-icon">📋</span>
          <span className="brand-name">NoticeBoard</span>
        </Link>

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

          {user && (
            <div className="notification-wrapper" ref={notificationRef}>
              <button
                className="notification-bell"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">Notifications</div>

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${n.isRead ? '' : 'unread'}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div>{n.message}</div>
                        <small>{new Date(n.createdAt).toLocaleString()}</small>
                      </div>
                    ))
                  ) : (
                    <div className="notification-item">No notifications</div>
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="nav-user-section">
              <span className="nav-user-info">
                Hi, <strong>{user.name}</strong>
                <span className="nav-role-badge">
                  {user.role === 'FACULTY' ? 'Faculty' : 'Student'}
                </span>
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
                <span className="nav-role-badge">
                  {user.role === 'FACULTY' ? 'Faculty' : 'Student'}
                </span>
              </div>
              <button
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                }}
                className="mobile-logout-btn"
              >
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