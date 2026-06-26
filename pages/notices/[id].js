import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getAuthUser } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { useAuth } from '../../context/AuthContext'
import { downloadNoticePDF } from '../../lib/pdf'

export async function getServerSideProps(context) {
  const user = getAuthUser(context.req)
  if (!user) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  // ── Extract userId safely (handles id, userId, or sub in token payload) ──
  const userId = parseInt(user.id ?? user.userId ?? user.sub)
  if (!userId || isNaN(userId)) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const noticeId = parseInt(context.params.id)
  if (isNaN(noticeId)) return { notFound: true }

  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
  })
  if (!notice) return { notFound: true }

  // ── Track view (upsert = only counts once per user per notice) ──
  await prisma.noticeView.upsert({
    where: {
      userId_noticeId: { userId, noticeId },
    },
    update: {},
    create: { userId, noticeId },
  })

  // ── Increment viewCount cache on Notice ──
  await prisma.notice.update({
    where: { id: noticeId },
    data: { viewCount: { increment: 1 } },
  })

  // ── Check if this user bookmarked it ──
  let isBookmarked = false
  if (user.role === 'STUDENT') {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_noticeId: { userId, noticeId } },
    })
    isBookmarked = !!bookmark
  }

  // ── Related notices (same category, exclude current) ──
  const related = await prisma.notice.findMany({
    where: {
      category: notice.category,
      id: { not: noticeId },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, title: true, publishDate: true, category: true },
  })

  return {
    props: {
      notice: {
        ...notice,
        publishDate: notice.publishDate.toISOString(),
        createdAt:   notice.createdAt.toISOString(),
        updatedAt:   notice.updatedAt.toISOString(),
        expiresAt:   notice.expiresAt ? notice.expiresAt.toISOString() : null,
      },
      isBookmarked,
      related: related.map(r => ({
        ...r,
        publishDate: r.publishDate.toISOString(),
      })),
    },
  }
}

export default function NoticeDetail({ notice, isBookmarked: initialBookmarked, related }) {
  const { user } = useAuth()
  const router = useRouter()
  const [downloading, setDownloading]   = useState(false)
  const [bookmarked, setBookmarked]     = useState(initialBookmarked)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [copied, setCopied]             = useState(false)

  const isFaculty = user?.role === 'FACULTY'

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      await downloadNoticePDF(notice)
    } catch (err) {
      console.error('PDF error:', err)
      alert('Error exporting PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleBookmark = async () => {
    if (!user) return
    setBookmarkLoading(true)
    try {
      if (bookmarked) {
        await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noticeId: notice.id }),
        })
        setBookmarked(false)
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noticeId: notice.id }),
        })
        setBookmarked(true)
      }
    } catch (err) {
      alert('Bookmark failed. Try again.')
    } finally {
      setBookmarkLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Copy this link: ' + url)
    }
  }

  const date = new Date(notice.publishDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const categoryClass = notice.category.toLowerCase()
  const priorityClass = notice.priority === 'Urgent' ? 'urgent' : ''

  return (
    <>
      <Head>
        <title>{notice.title} — NoticeBoard</title>
        <meta name="description" content={notice.body.substring(0, 150)} />
      </Head>

      <div className="notice-detail-page">

        {/* ── BACK ── */}
        <div className="detail-back-row">
          <button onClick={() => router.back()} className="btn-back">
            ⬅️ Go Back
          </button>
          <div className="detail-meta-right">
            <span className="view-count-badge">👁 {notice.viewCount || 0} views</span>
            {notice.isPinned && <span className="pinned-badge">📌 Pinned</span>}
          </div>
        </div>

        {/* ── MAIN NOTICE CARD ── */}
        <div className={`notice-detail-card ${priorityClass}`}>

          {notice.priority === 'Urgent' && (
            <div className="urgent-badge">🔴 URGENT NOTICE</div>
          )}

          {/* Meta row */}
          <div className="card-meta">
            <span className={`category-tag ${categoryClass}`}>
              {notice.category}
            </span>
            <span className="card-date">📅 Published: {date}</span>
            {notice.expiresAt && (
              <span className="expires-badge">
                ⏳ Expires: {new Date(notice.expiresAt).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="detail-title">{notice.title}</h1>

          {/* AI Summary */}
          {notice.aiSummary && (
            <div className="ai-summary-block detail-ai">
              <div className="ai-summary-label">✨ AI Summary</div>
              <p className="ai-summary-text">{notice.aiSummary}</p>
            </div>
          )}

          {/* Image */}
          {notice.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notice.imageUrl}
              alt={notice.title}
              className="detail-image"
            />
          )}

          {/* Body */}
          <div className="detail-body">{notice.body}</div>

          {/* ── ACTION ROW ── */}
          <div className="detail-actions">

            {/* PDF download */}
            <button
              onClick={handleDownloadPDF}
              className="btn-primary"
              disabled={downloading}
            >
              📥 {downloading ? 'Exporting...' : 'Download PDF'}
            </button>

            {/* Bookmark — students only */}
            {user && !isFaculty && (
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`btn-bookmark-detail ${bookmarked ? 'bookmarked' : ''}`}
              >
                {bookmarked ? '🔖 Saved' : '🔖 Save'}
              </button>
            )}

            {/* Share / copy link */}
            <button onClick={handleShare} className="btn-share">
              {copied ? '✅ Link copied!' : '🔗 Share'}
            </button>

            {/* Faculty controls */}
            {isFaculty && (
              <Link href={`/notices/edit/${notice.id}`} className="btn-secondary">
                ✏️ Edit Announcement
              </Link>
            )}
          </div>
        </div>

        {/* ── RELATED NOTICES ── */}
        {related && related.length > 0 && (
          <div className="related-section">
            <h2 className="related-title">More in {notice.category}</h2>
            <div className="related-grid">
              {related.map(r => (
                <Link key={r.id} href={`/notices/${r.id}`} className="related-card">
                  <span className="related-card-category">{r.category}</span>
                  <p className="related-card-title">{r.title}</p>
                  <span className="related-card-date">
                    {new Date(r.publishDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}