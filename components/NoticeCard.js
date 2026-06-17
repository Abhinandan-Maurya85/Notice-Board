import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

const CATEGORY_COLORS = {
  Exam: { bg: '#fef2f2', color: '#dc2626' },
  Event: { bg: '#eff6ff', color: '#2563eb' },
  General: { bg: '#f5f3ff', color: '#7c3aed' },
}

export default function NoticeCard({ notice, onDelete }) {
  const { user } = useAuth(); // FIX ADDED HERE

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${notice.title}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    const res = await fetch(`/api/notices/${notice.id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      onDelete(notice.id)
    } else {
      alert('Failed to delete. Please try again.')
    }
  }

  const date = new Date(notice.publishDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const catStyle =
    CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.General

  return (
    <div
      className={`notice-card ${
        notice.priority === 'Urgent' ? 'urgent' : ''
      }`}
    >
      {notice.priority === 'Urgent' && (
        <div className="urgent-badge">
          🔴 URGENT NOTICE
        </div>
      )}

      {notice.imageUrl && (
        <img
          src={notice.imageUrl}
          alt={notice.title}
          className="card-image"
        />
      )}

      <div className="card-body">
        <div className="card-meta">
          <span
            className="category-tag"
            style={{
              background: catStyle.bg,
              color: catStyle.color,
            }}
          >
            {notice.category}
          </span>

          <span className="card-date">
            📅 {date}
          </span>
        </div>

        <h2 className="card-title">
          {notice.title}
        </h2>

        <p className="card-text">
          {notice.body}
        </p>
      </div>

      {user && user.role === 'FACULTY' && (
        <div className="card-actions">
          <Link
            href={`/notices/edit/${notice.id}`}
            className="btn-edit"
          >
            ✏️ Edit
          </Link>

          <button
            onClick={handleDelete}
            className="btn-delete"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  )
}