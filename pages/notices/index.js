import Head from 'next/head'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NoticeCard from '../../components/NoticeCard'
import { prisma } from '../../lib/prisma'
import { getAuthUser } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

export async function getServerSideProps(context) {
  // Enforce server-side authentication redirect
  const user = getAuthUser(context.req)
  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const notices = await prisma.notice.findMany({
    orderBy: [{ createdAt: 'desc' }],
  })
  const sorted = [
    ...notices.filter(n => n.priority === 'Urgent'),
    ...notices.filter(n => n.priority === 'Normal'),
  ]
  return {
    props: {
      notices: sorted.map(n => ({
        ...n,
        publishDate: n.publishDate.toISOString(),
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      })),
    },
  }
}

const bgImages = ['/images/lu1.webp', '/images/lu2.webp']

export default function NoticesPage({ notices: initialNotices }) {
  const { user } = useAuth()
  const [notices, setNotices] = useState(initialNotices)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')


  // ✅ SLIDESHOW ADDED HERE
  const [bgIndex, setBgIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % bgImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = (id) => {
    setNotices(prev => prev.filter(n => n.id !== id))
  }

  const filtered = notices
    .filter(n => filter === 'All' || n.category === filter)
    .filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase())
    )

  const urgentCount = notices.filter(n => n.priority === 'Urgent').length
  const examCount = notices.filter(n => n.category === 'Exam').length
  const eventCount = notices.filter(n => n.category === 'Event').length

  return (
    <>
      <Head>
        <title>Notice Board — Stay Updated</title>
        <meta name="description" content="Official notice board for all announcements" />
      </Head>

      {/* HERO SECTION — ✅ BACKGROUND IMAGE ADDED HERE */}
      <div className="hero" style={{
        backgroundImage: `url(${bgImages[bgIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}>
        <div className="hero-content">
          <div className="hero-badge">📢 Live Announcements</div>
          <h1 className="hero-title">Notice Board</h1>
          <p className="hero-sub">Stay updated with all official announcements, exam schedules, and events</p>
          <div className="hero-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search notices by title or content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-num">{notices.length}</div>
            <div className="stat-label">Total Notices</div>
          </div>
        </div>
        <div className="stat-card stat-urgent">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <div className="stat-num">{urgentCount}</div>
            <div className="stat-label">Urgent</div>
          </div>
        </div>
        <div className="stat-card stat-exam">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-num">{examCount}</div>
            <div className="stat-label">Exams</div>
          </div>
        </div>
        <div className="stat-card stat-event">
          <div className="stat-icon">🎉</div>
          <div className="stat-info">
            <div className="stat-num">{eventCount}</div>
            <div className="stat-label">Events</div>
          </div>
        </div>
      </div>

      {/* FILTER + COUNT ROW */}
      <div className="toolbar">
        <div className="filter-bar">
          {['All', 'Exam', 'Event', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
            >
              {cat === 'All' ? '🗂 All' : cat === 'Exam' ? '📝 Exam' : cat === 'Event' ? '🎉 Event' : '📌 General'}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          {search && (
            <span className="search-result-info">
              {`${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`}
            </span>
          )}
          {user?.role === 'FACULTY' && (
            <Link href="/notices/create" className="post-btn-inline">
              + Post Notice
            </Link>
          )}
        </div>
      </div>

      {/* NOTICES GRID */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">{search ? '🔍' : '📭'}</span>
          <p>{search ? 'No notices match your search' : 'No notices yet'}</p>
          <span>{search ? 'Try a different keyword' : (user?.role === 'FACULTY' ? 'Be the first to post an announcement' : 'Check back later for updates')}</span>
          {!search && user?.role === 'FACULTY' && (
            <Link href="/notices/create" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
              Post First Notice
            </Link>
          )}
        </div>
      ) : (
        <div className="notices-grid">
          {filtered.map(notice => (
            <NoticeCard key={notice.id} notice={notice} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </>
  )
}