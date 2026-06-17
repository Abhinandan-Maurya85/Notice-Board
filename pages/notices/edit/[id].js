import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import NoticeForm from '../../../components/NoticeForm'
import { prisma } from '../../../lib/prisma'
import { getAuthUser } from '../../../lib/auth'

export async function getServerSideProps(context) {
  // Verify user and ensure they are faculty
  const user = getAuthUser(context.req)
  if (!user || user.role !== 'FACULTY') {
    return {
      redirect: {
        destination: '/notices',
        permanent: false,
      },
    }
  }

  const { params } = context
  const notice = await prisma.notice.findUnique({
    where: { id: parseInt(params.id) },
  })
  if (!notice) return { notFound: true }
  return {
    props: {
      notice: {
        ...notice,
        publishDate: notice.publishDate.toISOString().split('T')[0],
        createdAt: notice.createdAt.toISOString(),
        updatedAt: notice.updatedAt.toISOString(),
      },
    },
  }
}


export default function EditNotice({ notice }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/notices/${notice.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      return
    }
    router.push('/notices')
  }

  return (
    <>
      <Head><title>Edit Notice</title></Head>
      <div className="form-page">
        <div className="form-card">
          <h1>Edit Notice</h1>
          {error && <div className="error-box">{error}</div>}
          <NoticeForm onSubmit={handleSubmit} loading={loading} initialData={notice} />
        </div>
      </div>
    </>
  )
}