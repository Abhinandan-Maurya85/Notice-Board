import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const CATEGORY_COLORS = {
  Exam:    { bg: '#fef2f2', color: '#dc2626' },
  Event:   { bg: '#eff6ff', color: '#2563eb' },
  General: { bg: '#f5f3ff', color: '#7c3aed' },
  Fees:    { bg: '#fefce8', color: '#ca8a04' },
  Academic:{ bg: '#f0fdf4', color: '#16a34a' },
}

export default function NoticeCard({ notice, onDelete, initialBookmarked = false }) {
  const { user } = useAuth()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${notice.title}"?\n\nThis action cannot be undone.`
    )
    if (!confirmed) return

    const res = await fetch(`/api/notices/${notice.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete(notice.id)
    } else {
      alert('Failed to delete. Please try again.')
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

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(notice.title, 14, 20)

    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Category: ${notice.category}  |  Priority: ${notice.priority}`, 14, 30)
    doc.text(`Date: ${new Date(notice.publishDate).toLocaleDateString('en-IN')}`, 14, 37)

    doc.setFontSize(12)
    doc.setTextColor(0)
    const lines = doc.splitTextToSize(notice.body, 180)
    doc.text(lines, 14, 50)

    if (notice.aiSummary) {
      doc.setFontSize(11)
      doc.setTextColor(80, 40, 160)
      doc.text('AI Summary:', 14, 50 + lines.length * 7 + 10)
      const summaryLines = doc.splitTextToSize(notice.aiSummary, 180)
      doc.text(summaryLines, 14, 50 + lines.length * 7 + 18)
    }

    doc.save(`notice-${notice.id}.pdf`)
  }

  const date = new Date(notice.publishDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const catStyle = CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.General

  return (
    <div className={`notice-card ${notice.priority === 'Urgent' ? 'urgent' : ''} ${notice.isPinned ? 'pinned' : ''}`}>

      {notice.isPinned && (
        <div className="pinned-badge">📌 Pinned</div>
      )}

      {notice.priority === 'Urgent' && (
        <div className="urgent-badge">🔴 URGENT NOTICE</div>
      )}

      {notice.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={notice.imageUrl} alt={notice.title} className="card-image" />
      )}

      <div className="card-body">
        <div className="card-meta">
          <span className="category-tag" style={{ background: catStyle.bg, color: catStyle.color }}>
            {notice.category}
          </span>
          <span className="card-date">📅 {date}</span>
          <span className="view-count">👁 {notice.viewCount || 0} views</span>
        </div>

        <h2 className="card-title">{notice.title}</h2>

        {/* AI Summary block */}
        {notice.aiSummary && (
          <div className="ai-summary-block">
            <div className="ai-summary-label">✨ AI Summary</div>
            <p className="ai-summary-text">{notice.aiSummary}</p>
          </div>
        )}

        <p className="card-text">{notice.body}</p>
      </div>

      {/* Action buttons — all users */}
      <div className="card-actions">
        <Link href={`/notices/${notice.id}`} className="btn-view">
          👁 View
        </Link>

        <button onClick={handleDownloadPDF} className="btn-pdf">
          📄 PDF
        </button>

        {user && (
          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className={`btn-bookmark ${bookmarked ? 'bookmarked' : ''}`}
          >
            {bookmarked ? '🔖 Saved' : '🔖 Save'}
          </button>
        )}

        {/* Faculty only */}
        {user && user.role === 'FACULTY' && (
          <>
            <Link href={`/notices/edit/${notice.id}`} className="btn-edit">
              ✏️ Edit
            </Link>
            <button onClick={handleDelete} className="btn-delete">
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}