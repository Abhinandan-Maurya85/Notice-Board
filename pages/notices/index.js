import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import NoticeCard from '../../components/NoticeCard'
import { prisma } from '../../lib/prisma'
import { getAuthUser } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

export async function getServerSideProps(context) {
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
    ...notices.filter(n => n.isPinned),
    ...notices.filter(n => !n.isPinned && n.priority === 'Urgent'),
    ...notices.filter(n => !n.isPinned && n.priority !== 'Urgent'),
  ]

  // Fetch this user's bookmarks so cards know initial state
  let bookmarkedIds = []
  if (user.role === 'STUDENT') {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      select: { noticeId: true },
    })
    bookmarkedIds = bookmarks.map(b => b.noticeId)
  }

  return {
    props: {
      notices: sorted.map(n => ({
        ...n,
        publishDate: n.publishDate.toISOString(),
        createdAt:   n.createdAt.toISOString(),
        updatedAt:   n.updatedAt.toISOString(),
        expiresAt:   n.expiresAt ? n.expiresAt.toISOString() : null,
      })),
      bookmarkedIds,
    },
  }
}

const bgImages = ['/images/lu1.webp', '/images/lu2.webp']

const CATEGORIES = ['All', 'Exam', 'Event', 'General', 'Fees', 'Academic', 'Placement']

const CAT_ICONS = {
  All:       '🗂',
  Exam:      '📝',
  Event:     '🎉',
  General:   '📌',
  Fees:      '💰',
  Academic:  '📚',
  Placement: '🏆',
}

export default function NoticesPage({ notices: initialNotices, bookmarkedIds }) {
  const { user } = useAuth()

  // ── state ──────────────────────────────────────────────
  const [notices, setNotices]       = useState(initialNotices)
  const [filter, setFilter]         = useState('All')
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')  // raw input, debounced into search
  const [sortBy, setSortBy]         = useState('newest')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [loading, setLoading]       = useState(false)

  // slideshow — unchanged from your original
  const [bgIndex, setBgIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % bgImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // ── debounced search ───────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ── server search (when search query changes) ──────────
  const fetchNotices = useCallback(async (q, category) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q)                        params.set('q', q)
      if (category && category !== 'All') params.set('category', category)

      const res = await fetch(`/api/notices?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setNotices(data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only hit server if search has a value; otherwise use SSR data
    if (search || filter !== 'All') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotices(search, filter)
    } else {
      setNotices(initialNotices)
    }
  }, [search, filter, fetchNotices, initialNotices])

  // ── delete handler ─────────────────────────────────────
  const handleDelete = (id) => {
    setNotices(prev => prev.filter(n => n.id !== id))
  }

  // ── client-side sort (on top of server results) ────────
  const sorted = [...notices].sort((a, b) => {
    if (sortBy === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'views')   return (b.viewCount || 0) - (a.viewCount || 0)
    return 0
  })

  const filtered = showPinnedOnly ? sorted.filter(n => n.isPinned) : sorted

  // ── stats ──────────────────────────────────────────────
  const urgentCount  = notices.filter(n => n.priority === 'Urgent').length
  const examCount    = notices.filter(n => n.category === 'Exam').length
  const eventCount   = notices.filter(n => n.category === 'Event').length

  return (
    <>
      <Head>
        <title>Notice Board — Stay Updated</title>
        <meta name="description" content="Official notice board for all announcements" />
      </Head>

      {/* ── HERO — YOUR ORIGINAL, UNTOUCHED ── */}
      <div className="hero" style={{
        backgroundImage: `url(${bgImages[bgIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}>
        <div className="hero-content">
          <div className="hero-badge">📢 Live Announcements</div>
          <h1 className="hero-title">Notice Board</h1>
          <p className="hero-sub">
            Stay updated with all official announcements, exam schedules, and events
          </p>
          <div className="hero-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search notices by title or content..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="search-input"
            />
            {searchInput && (
              <button
                className="search-clear"
                onClick={() => { setSearchInput(''); setSearch('') }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* ── STATS — YOUR ORIGINAL, UNTOUCHED ── */}
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

      {/* ── TOOLBAR — upgraded ── */}
      <div className="toolbar">
        {/* Category filters */}
        <div className="filter-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Right side controls */}
        <div className="toolbar-right">

          {/* Pinned toggle */}
          <button
            className={`filter-btn ${showPinnedOnly ? 'active' : ''}`}
            onClick={() => setShowPinnedOnly(p => !p)}
            title="Show pinned only"
          >
            📌 Pinned
          </button>

          {/* Sort dropdown */}
          <select
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="views">Most viewed</option>
          </select>

          {/* Search result count */}
          {search && (
            <span className="search-result-info">
              {loading
                ? 'Searching...'
                : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
              }
            </span>
          )}

          {/* Faculty post button */}
          {user?.role === 'FACULTY' && (
            <Link href="/notices/create" className="post-btn-inline">
              + Post Notice
            </Link>
          )}
        </div>
      </div>

      {/* ── LOADING STATE ── */}
      {loading && (
        <div className="notices-loading">
          <div className="loading-spinner" />
          <span>Searching notices...</span>
        </div>
      )}

      {/* ── NOTICES GRID ── */}
      {!loading && filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">{search ? '🔍' : '📭'}</span>
          <p>{search ? 'No notices match your search' : 'No notices yet'}</p>
          <span>
            {search
              ? 'Try a different keyword'
              : user?.role === 'FACULTY'
                ? 'Be the first to post an announcement'
                : 'Check back later for updates'
            }
          </span>
          {!search && user?.role === 'FACULTY' && (
            <Link href="/notices/create" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
              Post First Notice
            </Link>
          )}
        </div>
      ) : (
        !loading && (
          <div className="notices-grid">
            {filtered.map(notice => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onDelete={handleDelete}
                initialBookmarked={bookmarkedIds?.includes(notice.id)}
              />
            ))}
          </div>
        )
      )}
    </>
  )
}