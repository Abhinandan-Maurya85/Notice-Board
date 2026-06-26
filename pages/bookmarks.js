import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import NoticeCard from '../components/NoticeCard'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Bookmarks() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/bookmarks')
        if (res.ok) {
          const data = await res.json()
          setBookmarks(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [user, router])

  const handleDelete = (id) => {
    setBookmarks(prev => prev.filter(b => b.noticeId !== id))
  }

  if (loading) return <div className="loading">Loading saved notices...</div>

  return (
    <div className="page-container">
      <h1 className="page-title">🔖 Saved Notices</h1>
      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <p>No saved notices yet.</p>
          <Link href="/notices">Browse notices →</Link>
        </div>
      ) : (
        <div className="notices-grid">
          {bookmarks.map(b => (
            <NoticeCard
              key={b.id}
              notice={b.notice}
              onDelete={handleDelete}
              initialBookmarked={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}