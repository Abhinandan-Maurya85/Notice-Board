import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { getAuthUser } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { useAuth } from '../../context/AuthContext'
import { downloadNoticePDF } from '../../lib/pdf'
import ChatWidget from '../../components/ChatWidget'

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

  const { params } = context
  const noticeId = parseInt(params.id)

  if (isNaN(noticeId)) {
    return { notFound: true }
  }

  const notice = await prisma.notice.findUnique({
    where: { id: noticeId }
  })

  if (!notice) {
    return { notFound: true }
  }

  return {
    props: {
      notice: {
        ...notice,
        publishDate: notice.publishDate.toISOString(),
        createdAt: notice.createdAt.toISOString(),
        updatedAt: notice.updatedAt.toISOString(),
      }
    }
  }
}

export default function NoticeDetail({ notice }) {
  const { user } = useAuth()
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)

  const isFaculty = user?.role === 'FACULTY'

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      await downloadNoticePDF(notice)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      alert('Error exporting PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const date = new Date(notice.publishDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Tag styling based on category
  const categoryClass = notice.category.toLowerCase()
  const priorityClass = notice.priority === 'Urgent' ? 'urgent' : ''

  return (
    <>
      <Head>
        <title>{notice.title} — NoticeBoard</title>
        <meta name="description" content={notice.body.substring(0, 150)} />
      </Head>

      <div className="analytics-container" style={{ maxWidth: '800px', marginTop: '30px' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => router.back()} 
            className="analytics-refresh-btn" 
            style={{ padding: '8px 14px' }}
          >
            ⬅️ Go Back
          </button>
        </div>

        {/* Notice Card */}
        <div className={`notice-card ${priorityClass}`} style={{ width: '100%', padding: '30px', cursor: 'default' }}>
          {notice.priority === 'Urgent' && (
            <div className="urgent-badge" style={{ marginBottom: '15px' }}>
              🔴 URGENT NOTICE
            </div>
          )}

          <div className="card-meta" style={{ marginBottom: '15px' }}>
            <span className={`category-tag ${categoryClass}`} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              {notice.category}
            </span>
            <span className="card-date" style={{ fontSize: '0.9rem' }}>
              📅 Published: {date}
            </span>
          </div>

          <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '20px', lineHeight: '1.25' }}>
            {notice.title}
          </h1>

          {/* Attachment Image */}
          {notice.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notice.imageUrl}
              alt={notice.title}
              className="card-image"
              style={{ maxHeight: '400px', objectFit: 'contain', width: '100%', marginBottom: '25px', borderRadius: '12px' }}
            />
          )}

          {/* Body */}
          <div className="card-text" style={{ fontSize: '1.1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#334155' }}>
            {notice.body}
          </div>

          {/* Action Row */}
          <div className="form-actions" style={{ marginTop: '35px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              disabled={downloading}
            >
              📥 {downloading ? 'Exporting PDF...' : 'Download PDF'}
            </button>

            {isFaculty && (
              <Link 
                href={`/notices/edit/${notice.id}`} 
                className="btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✏️ Edit Announcement
              </Link>
            )}
          </div>
        </div>
      </div>
      <ChatWidget />
    </>
  )
}
