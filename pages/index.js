import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ notices: 0, students: 0, faculty: 0 })
  const [recentNotices, setRecentNotices] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [bgIndex, setBgIndex] = useState(0)

  const backgrounds = [
    '/images/lu1.webp',
    '/images/lu2.webp',
    '/images/lu3.webp',
  ]

  // Auto-rotate background every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error('Stats fetch failed:', err)
      } finally {
        setStatsLoading(false)
      }
    }

    const fetchRecentNotices = async () => {
      try {
        const res = await fetch('/api/notices/recent')
        if (res.ok) {
          const data = await res.json()
          setRecentNotices(data)
        }
      } catch (err) {
        console.error('Recent notices fetch failed:', err)
      }
    }

    fetchStats()
    fetchRecentNotices()
  }, [])

  const isFaculty = user?.role === 'FACULTY'

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section
        className="hero-section"
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Sliding background images */}
        {backgrounds.map((bg, i) => (
          <div
            key={bg}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: i === bgIndex ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
              zIndex: 0,
            }}
          />
        ))}

        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1,
          }}
        />

        {/* Hero content */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>

          <h1 className="hero-title">
            University Notice Board,<br />
            <span className="hero-title-accent">Reimagined</span>
          </h1>

          <p className="hero-subtitle">
            Centralized, searchable, and real-time. Students and faculty
            stay in sync — always.
          </p>

          <div className="hero-ctas">
            {!user ? (
              <>
                <Link href="/notices" className="btn-primary">
                  Browse Notices
                </Link>
                <Link href="/login" className="btn-secondary">
                  Login →
                </Link>
              </>
            ) : isFaculty ? (
              <>
                <Link href="/notices/create" className="btn-primary">
                  + Post Notice
                </Link>
                <Link href="/analytics" className="btn-secondary">
                  View Analytics →
                </Link>
              </>
            ) : (
              <>
                <Link href="/notices" className="btn-primary">
                  View Notices
                </Link>
                <Link href="/notices?filter=unread" className="btn-secondary">
                  Unread Only →
                </Link>
              </>
            )}
          </div>

          {/* Stat strip */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">
                {statsLoading ? '—' : stats.notices}
              </span>
              <span className="hero-stat-label">Notices Published</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">
                {statsLoading ? '—' : stats.students}
              </span>
              <span className="hero-stat-label">Active Students</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">
                {statsLoading ? '—' : stats.faculty}
              </span>
              <span className="hero-stat-label">Faculty Members</span>
            </div>
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
            {backgrounds.map((_, i) => (
              <button
                key={i}
                onClick={() => setBgIndex(i)}
                style={{
                  width: i === bgIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === bgIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ── RECENT NOTICES TICKER ── */}
      {recentNotices.length > 0 && (
        <div className="ticker-bar">
          <span className="ticker-label">🔴 Live</span>
          <div className="ticker-track">
            <div className="ticker-content">
              {recentNotices.map((n, i) => (
                <span key={n.id}>
                  <Link href={`/notices/${n.id}`} className="ticker-link">
                    {n.title}
                  </Link>
                  {i < recentNotices.length - 1 && (
                    <span className="ticker-sep"> &nbsp;·&nbsp; </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURES GRID ── */}
      <section className="features-section">
        <h2 className="section-title">Everything you need</h2>
        <p className="section-subtitle">
          Built for real university workflows — not just a demo.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3 className="feature-title">Student Portal</h3>
            <p className="feature-desc">
              Access, search, bookmark, and download notices instantly.
              Get real-time alerts the moment something is posted.
            </p>
            <span className="feature-tag">Real-time</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3 className="feature-title">Faculty Portal</h3>
            <p className="feature-desc">
              Create, pin, and manage notices with role-based access.
              Track who has read your announcements.
            </p>
            <span className="feature-tag">RBAC</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">AI Summaries</h3>
            <p className="feature-desc">
              Gemini AI automatically generates 2-line summaries for
              every notice so students never miss key info.
            </p>
            <span className="feature-tag">Gemini API</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3 className="feature-title">Live Notifications</h3>
            <p className="feature-desc">
              Socket.IO pushes instant per-user notifications the
              moment a new notice is published.
            </p>
            <span className="feature-tag">Socket.IO</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">PDF Export</h3>
            <p className="feature-desc">
              Download any notice as a formatted PDF in one click.
              Includes AI summary and notice metadata.
            </p>
            <span className="feature-tag">jsPDF</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Analytics Dashboard</h3>
            <p className="feature-desc">
              Faculty sees view counts, read rates, category trends,
              and daily activity charts.
            </p>
            <span className="feature-tag">Recharts</span>
          </div>
        </div>
      </section>

      {/* ── FACULTY CTA (only shown to faculty) ── */}
      {isFaculty && (
        <section className="faculty-banner">
          <div className="faculty-banner-text">
            <h3>📊 Your Analytics Dashboard</h3>
            <p>
              View notice performance, track read rates, and manage
              all announcements from one place.
            </p>
          </div>
          <Link href="/analytics" className="btn-primary">
            Open Dashboard →
          </Link>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <h2 className="section-title">How it works</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-num">1</div>
            <h4>Faculty posts a notice</h4>
            <p>With category, priority, and optional expiry date.</p>
          </div>
          <div className="how-step-arrow">→</div>
          <div className="how-step">
            <div className="how-step-num">2</div>
            <h4>AI generates a summary</h4>
            <p>Gemini creates a 2-line digest automatically.</p>
          </div>
          <div className="how-step-arrow">→</div>
          <div className="how-step">
            <div className="how-step-num">3</div>
            <h4>Students get notified</h4>
            <p>Real-time push via Socket.IO, per-user rooms.</p>
          </div>
          <div className="how-step-arrow">→</div>
          <div className="how-step">
            <div className="how-step-num">4</div>
            <h4>Students read & download</h4>
            <p>Bookmark, PDF export, set reminders.</p>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      {!user && (
        <section className="bottom-cta">
          <h2>Ready to get started?</h2>
          <p>Join your university&apos;s notice board today.</p>
          <div className="bottom-cta-buttons">
            <Link href="/signup" className="btn-primary">
              Create Account
            </Link>
            <Link href="/notices" className="btn-secondary">
              Browse as Guest →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}