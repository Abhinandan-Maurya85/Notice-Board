import { useState } from 'react'
import Link from 'next/link'

export default function NoticeForm({ onSubmit, loading, initialData }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    body: initialData?.body || '',
    category: initialData?.category || 'General',
    priority: initialData?.priority || 'Normal',
    publishDate: initialData?.publishDate || '',
    imageUrl: initialData?.imageUrl || '',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="notice-form">
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter notice title"
          required
        />
      </div>

      <div className="form-group">
        <label>Body *</label>
        <textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder="Enter notice details..."
          rows={5}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Exam">Exam</option>
            <option value="Event">Event</option>
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label>Publish Date *</label>
          <input
            type="date"
            name="publishDate"
            value={form.publishDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Image URL (optional)</label>
        <input
          type="url"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="form-actions">
        <Link href="/notices" className="btn-secondary">Cancel</Link>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Notice' : 'Post Notice'}
        </button>
      </div>
    </form>
  )
}