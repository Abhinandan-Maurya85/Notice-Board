import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = ['General', 'Exam', 'Event', 'Academic', 'Sports']
const PRIORITIES = ['NORMAL', 'HIGH', 'URGENT', 'LOW']
const PRIORITY_LABELS = { NORMAL: 'Normal', HIGH: 'High', URGENT: 'Urgent', LOW: 'Low' }
const BODY_MAX = 2000

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {}
  if (!form.title.trim()) errs.title = 'Title is required'
  else if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters'
  else if (form.title.length > 150) errs.title = 'Title must be under 150 characters'

  if (!form.body.trim()) errs.body = 'Body is required'
  else if (form.body.trim().length < 10) errs.body = 'Body must be at least 10 characters'
  else if (form.body.length > BODY_MAX) errs.body = `Body must be under ${BODY_MAX} characters`

  if (!form.publishDate) errs.publishDate = 'Publish date is required'

  if (form.expiresAt && form.publishDate && form.expiresAt <= form.publishDate) {
    errs.expiresAt = 'Expiry must be after the publish date'
  }

  if (form.imageUrl && !/^https?:\/\/.+\..+/.test(form.imageUrl)) {
    errs.imageUrl = 'Enter a valid URL starting with http:// or https://'
  }

  return errs
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }) {
  return (
    <label htmlFor={id} className="toggle-wrap">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="toggle-input"
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </label>
  )
}

// ── Field error ───────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null
  return <span className="field-error">⚠ {msg}</span>
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NoticeForm({ onSubmit, loading, initialData }) {
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    title:       initialData?.title       || '',
    body:        initialData?.body        || '',
    category:    initialData?.category    || 'General',
    priority:    initialData?.priority    || 'NORMAL',
    publishDate: initialData?.publishDate || today,
    imageUrl:    initialData?.imageUrl    || '',
    isPinned:    initialData?.isPinned    ?? false,
    expiresAt:   initialData?.expiresAt
                   ? new Date(initialData.expiresAt).toISOString().slice(0, 10)
                   : '',
  })

  const [errors, setErrors]       = useState({})
  const [touched, setTouched]     = useState({})
  const [submitted, setSubmitted] = useState(false)

  // ── Helpers ──────────────────────────────────────────────────────────────
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Re-validate touched field live
    if (touched[field] || submitted) {
      const next = { ...form, [field]: value }
      const errs = validate(next)
      setErrors(prev => ({ ...prev, [field]: errs[field] }))
    }
  }

  const handleChange = (e) => set(e.target.name, e.target.value)

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const errs = validate(form)
    setErrors(prev => ({ ...prev, [name]: errs[name] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    // Normalise before sending
    const payload = {
      ...form,
      title:    form.title.trim(),
      body:     form.body.trim(),
      imageUrl: form.imageUrl.trim() || null,
      expiresAt: form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : null,
    }
    onSubmit(payload)
  }

  const bodyLeft = BODY_MAX - form.body.length
  const isEditing = !!initialData

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="nf-form">

        {/* ── Title ── */}
        <div className={`nf-group ${errors.title ? 'has-error' : ''}`}>
          <label htmlFor="title" className="nf-label">
            Title <span className="nf-required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Mid-semester exam schedule released"
            maxLength={150}
            className="nf-input"
          />
          <div className="nf-row-between">
            <FieldError msg={errors.title} />
            <span className="nf-count">{form.title.length}/150</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={`nf-group ${errors.body ? 'has-error' : ''}`}>
          <label htmlFor="body" className="nf-label">
            Body <span className="nf-required">*</span>
          </label>
          <textarea
            id="body"
            name="body"
            value={form.body}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Write the full notice details here…"
            rows={6}
            maxLength={BODY_MAX}
            className="nf-textarea"
          />
          <div className="nf-row-between">
            <FieldError msg={errors.body} />
            <span className={`nf-count ${bodyLeft < 100 ? 'nf-count-warn' : ''}`}>
              {bodyLeft} left
            </span>
          </div>
        </div>

        {/* ── Category · Priority · Publish date ── */}
        <div className="nf-row">
          <div className="nf-group">
            <label htmlFor="category" className="nf-label">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="nf-select"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="nf-group">
            <label htmlFor="priority" className="nf-label">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={`nf-select nf-priority-${form.priority}`}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          <div className={`nf-group ${errors.publishDate ? 'has-error' : ''}`}>
            <label htmlFor="publishDate" className="nf-label">
              Publish date <span className="nf-required">*</span>
            </label>
            <input
              id="publishDate"
              name="publishDate"
              type="date"
              value={form.publishDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className="nf-input"
            />
            <FieldError msg={errors.publishDate} />
          </div>
        </div>

        {/* ── Expires at ── */}
        <div className={`nf-group ${errors.expiresAt ? 'has-error' : ''}`}>
          <label htmlFor="expiresAt" className="nf-label">
            Expiry date
            <span className="nf-hint">optional — notice hides after this date</span>
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            min={form.publishDate || today}
            onChange={handleChange}
            onBlur={handleBlur}
            className="nf-input nf-input-half"
          />
          <FieldError msg={errors.expiresAt} />
        </div>

        {/* ── Image URL ── */}
        <div className={`nf-group ${errors.imageUrl ? 'has-error' : ''}`}>
          <label htmlFor="imageUrl" className="nf-label">
            Image URL
            <span className="nf-hint">optional</span>
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://example.com/banner.jpg"
            className="nf-input"
          />
          <FieldError msg={errors.imageUrl} />
        </div>

        {/* ── Pin notice toggle ── */}
        <div className="nf-toggle-row">
          <div className="nf-toggle-text">
            <span className="nf-label" style={{ marginBottom: 0 }}>
              📌 Pin this notice
            </span>
            <span className="nf-hint" style={{ display: 'block', marginTop: 2 }}>
              Pinned notices appear at the top of the feed for all students
            </span>
          </div>
          <Toggle
            id="isPinned"
            checked={form.isPinned}
            onChange={(e) => set('isPinned', e.target.checked)}
          />
        </div>

        {/* ── Actions ── */}
        <div className="nf-actions">
          <Link href="/notices" className="nf-btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="nf-btn-primary"
            disabled={loading}
          >
            {loading
              ? <><span className="nf-spinner" /> Saving…</>
              : isEditing ? 'Update notice' : 'Post notice'}
          </button>
        </div>
      </form>

      <style jsx>{`
        /* ── Form layout ── */
        .nf-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Groups ── */
        .nf-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .nf-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .nf-row-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 18px;
        }

        /* ── Labels ── */
        .nf-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }
        .nf-required { color: #ef4444; }
        .nf-hint {
          font-size: 11px;
          font-weight: 400;
          color: #9ca3af;
        }

        /* ── Inputs ── */
        .nf-input,
        .nf-textarea,
        .nf-select {
          width: 100%;
          padding: 9px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
          box-sizing: border-box;
        }
        .nf-input:focus,
        .nf-textarea:focus,
        .nf-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .nf-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
        .nf-input-half { max-width: 220px; }

        /* ── Error state ── */
        .has-error .nf-input,
        .has-error .nf-textarea,
        .has-error .nf-select {
          border-color: #ef4444;
        }
        .has-error .nf-input:focus,
        .has-error .nf-textarea:focus {
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
        }
        .field-error {
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
        }

        /* ── Priority select colour ── */
        .nf-priority-URGENT { color: #ef4444; border-color: #fecaca; background: #fff5f5; }
        .nf-priority-HIGH   { color: #f97316; border-color: #fed7aa; background: #fff7ed; }
        .nf-priority-NORMAL { color: #3b82f6; }
        .nf-priority-LOW    { color: #6b7280; }

        /* ── Char counter ── */
        .nf-count {
          font-size: 11px;
          color: #9ca3af;
          margin-left: auto;
        }
        .nf-count-warn { color: #f97316; font-weight: 600; }

        /* ── Toggle ── */
        .nf-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 14px 16px;
          gap: 16px;
        }
        .nf-toggle-text { flex: 1; }
        .toggle-wrap { cursor: pointer; flex-shrink: 0; }
        .toggle-input { display: none; }
        .toggle-track {
          display: block;
          width: 44px;
          height: 24px;
          background: #e5e7eb;
          border-radius: 99px;
          position: relative;
          transition: background 0.2s;
        }
        .toggle-input:checked + .toggle-track { background: #3b82f6; }
        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: left 0.2s;
        }
        .toggle-input:checked + .toggle-track .toggle-thumb { left: 23px; }

        /* ── Actions ── */
        .nf-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 4px;
          border-top: 1px solid #f3f4f6;
          margin-top: 4px;
        }
        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }
        .nf-btn-primary:hover:not(:disabled) { background: #2563eb; }
        .nf-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .nf-btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 10px 18px;
          background: transparent;
          color: #6b7280;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s, border-color 0.15s;
          font-family: inherit;
          cursor: pointer;
        }
        .nf-btn-secondary:hover { color: #111827; border-color: #9ca3af; }

        /* ── Spinner ── */
        .nf-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: nf-spin 0.6s linear infinite;
        }
        @keyframes nf-spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .nf-row { grid-template-columns: 1fr; }
          .nf-input-half { max-width: 100%; }
        }
      `}</style>
    </>
  )
}