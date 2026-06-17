import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import NoticeForm from '../../components/NoticeForm'
import { getAuthUser } from '../../lib/auth'

export async function getServerSideProps(context) {
  const user = getAuthUser(context.req)
  if (!user || user.role !== 'FACULTY') {
    return {
      redirect: {
        destination: '/notices',
        permanent: false,
      },
    }
  }
  return { props: {} }
}

export default function CreateNotice() {

  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/notices', {
      method: 'POST',
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
      <Head><title>Post Notice</title></Head>
      <div className="form-page">
        <div className="form-card">
          <h1>Post a New Notice</h1>
          {error && <div className="error-box">{error}</div>}
          <NoticeForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </>
  )
}