import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { getAuthUser } from '../lib/auth'
import { prisma } from '../lib/prisma'
import ChatWidget from '../components/ChatWidget'

export async function getServerSideProps(context) {
  // Server-side authentication and role check
  const user = getAuthUser(context.req)
  if (!user || user.role !== 'FACULTY') {
    return {
      redirect: {
        destination: '/notices',
        permanent: false,
      },
    }
  }

  try {
    const totalNotices = await prisma.notice.count()
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    })
    const urgentNotices = await prisma.notice.count({
      where: { priority: 'Urgent' }
    })

    const categoryExam = await prisma.notice.count({
      where: { category: 'Exam' }
    })
    const categoryEvent = await prisma.notice.count({
      where: { category: 'Event' }
    })
    const categoryGeneral = await prisma.notice.count({
      where: { category: 'General' }
    })

    // Graph data for notices posted in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentNoticesForGraph = await prisma.notice.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    })

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dailyCounts = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dailyCounts[dayNames[d.getDay()]] = 0
    }

    recentNoticesForGraph.forEach(notice => {
      const dayLabel = dayNames[new Date(notice.createdAt).getDay()]
      if (dailyCounts[dayLabel] !== undefined) {
        dailyCounts[dayLabel]++
      }
    })

    const activityData = Object.keys(dailyCounts).reverse().map(day => ({
      day,
      count: dailyCounts[day]
    }))

    // Lists for logs
    const recentNoticesList = await prisma.notice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        createdAt: true
      }
    })

    const recentStudentsList = await prisma.user.findMany({
      take: 5,
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    return {
      props: {
        stats: {
          totalNotices,
          totalStudents,
          urgentNotices,
          categoryBreakdown: [
            { name: 'Exam', count: categoryExam, color: '#ef4444' },
            { name: 'Event', count: categoryEvent, color: '#3b82f6' },
            { name: 'General', count: categoryGeneral, color: '#8b5cf6' }
          ],
          activityData,
          recentNotices: recentNoticesList.map(n => ({
            ...n,
            createdAt: n.createdAt.toISOString()
          })),
          recentStudents: recentStudentsList.map(s => ({
            ...s,
            createdAt: s.createdAt.toISOString()
          }))
        }
      }
    }
  } catch (error) {
    console.error('Failed to load server side analytics stats:', error)
    return {
      props: {
        stats: null,
        error: error.message
      }
    }
  }
}

export default function AnalyticsDashboard({ stats, error }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [hoveredSlice, setHoveredSlice] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [currentStats, setCurrentStats] = useState(stats)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const data = await res.json()
        setCurrentStats(data)
      }
    } catch (err) {
      console.error('Failed to refresh analytics:', err)
    } finally {
      setRefreshing(false)
    }
  }

  if (error || !currentStats) {
    return (
      <div className="analytics-container">
        <div className="error-box">
          <h2>Failed to load analytics dashboard</h2>
          <p>{error || 'An unexpected error occurred. Please try again.'}</p>
          <button onClick={handleRefresh} className="btn-primary" style={{ marginTop: '15px' }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const { totalNotices, totalStudents, urgentNotices, categoryBreakdown, activityData, recentNotices, recentStudents } = currentStats

  // SVG Line Area Chart computations
  const width = 500
  const height = 200
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 35

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Find max count to scale graph appropriately
  const maxCount = Math.max(...activityData.map(d => d.count), 5)

  // Map data points to SVG coordinates
  const points = activityData.map((d, index) => {
    const x = paddingLeft + index * (chartWidth / (activityData.length - 1))
    const y = paddingTop + chartHeight - (d.count / maxCount) * chartHeight
    return { x, y, label: d.day, count: d.count }
  })

  // Generate SVG paths
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : ''

  // Generate Y axis ticks
  const yTicks = []
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxCount / 4) * i)
    const yVal = paddingTop + chartHeight - (val / maxCount) * chartHeight
    yTicks.push({ val, y: yVal })
  }

  // Donut chart computations
  const donutRadius = 50
  const donutCircumference = 2 * Math.PI * donutRadius
  const donutTotal = categoryBreakdown.reduce((sum, item) => sum + item.count, 0)
  let accumulatedPercentage = 0

  return (
    <>
      <Head>
        <title>Analytics Dashboard — NoticeBoard</title>
        <meta name="description" content="Faculty analytics insights dashboard" />
      </Head>

      <div className="analytics-container">
        {/* Page Header */}
        <div className="analytics-header">
          <div className="analytics-title-area">
            <h1>Analytics Dashboard</h1>
            <p>Real-time insights on campus updates, student registration, and notice activity</p>
          </div>
          <button 
            onClick={handleRefresh} 
            className="analytics-refresh-btn"
            disabled={refreshing}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card">
            <div className="stat-card-icon-box notices">📢</div>
            <div className="stat-card-info">
              <span className="stat-card-val">{totalNotices}</span>
              <span className="stat-card-lbl">Total Notices</span>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-card-icon-box students">🎓</div>
            <div className="stat-card-info">
              <span className="stat-card-val">{totalStudents}</span>
              <span className="stat-card-lbl">Total Students</span>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-card-icon-box urgent">🔴</div>
            <div className="stat-card-info">
              <span className="stat-card-val">{urgentNotices}</span>
              <span className="stat-card-lbl">Urgent Notices</span>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-card-icon-box active">📈</div>
            <div className="stat-card-info">
              <span className="stat-card-val">
                {activityData.reduce((sum, d) => sum + d.count, 0)}
              </span>
              <span className="stat-card-lbl">Weekly Activity</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="analytics-charts-grid">
          {/* Activity Over Time Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-card-title">📈 Post Frequency</h3>
                <p className="chart-card-subtitle">Volume of announcements published in the last 7 days</p>
              </div>
            </div>

            <div className="chart-svg-container">
              <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid Lines */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line 
                      x1={paddingLeft} 
                      y1={tick.y} 
                      x2={width - paddingRight} 
                      y2={tick.y} 
                      className="chart-grid-line" 
                    />
                    <text 
                      x={paddingLeft - 12} 
                      y={tick.y} 
                      className="chart-y-label-text"
                    >
                      {tick.val}
                    </text>
                  </g>
                ))}

                {/* Bottom X Axis Line */}
                <line 
                  x1={paddingLeft} 
                  y1={paddingTop + chartHeight} 
                  x2={width - paddingRight} 
                  y2={paddingTop + chartHeight} 
                  className="chart-axis-line" 
                />

                {/* X Axis Labels */}
                {points.map((p, i) => (
                  <text 
                    key={i} 
                    x={p.x} 
                    y={paddingTop + chartHeight + 20} 
                    className="chart-label-text"
                  >
                    {p.label}
                  </text>
                ))}

                {/* Area under the line */}
                {areaPath && <path d={areaPath} className="chart-area-path" />}

                {/* Main line path */}
                {linePath && <path d={linePath} className="chart-line-path" />}

                {/* Interaction points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    className="chart-node"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint && (
                <div 
                  className="chart-tooltip"
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100}%`
                  }}
                >
                  {hoveredPoint.count} post{hoveredPoint.count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown Donut Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-card-title">🍩 Notices by Category</h3>
                <p className="chart-card-subtitle">Distribution of categories across all published notices</p>
              </div>
            </div>

            <div className="donut-chart-container">
              <div className="donut-svg-wrapper">
                <svg viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  {donutTotal > 0 ? (
                    categoryBreakdown.map((item, i) => {
                      if (item.count === 0) return null
                      const percentage = item.count / donutTotal
                      const strokeDasharray = `${percentage * donutCircumference} ${donutCircumference}`
                      const strokeDashoffset = -accumulatedPercentage * donutCircumference
                      accumulatedPercentage += percentage

                      return (
                        <circle
                          key={i}
                          cx="80"
                          cy="80"
                          r="50"
                          className="donut-slice"
                          stroke={item.color}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          onMouseEnter={() => setHoveredSlice(item)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      )
                    })
                  ) : (
                    <circle cx="80" cy="80" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  )}
                </svg>
                <div className="donut-center-text">
                  <span className="donut-center-num">
                    {hoveredSlice ? hoveredSlice.count : totalNotices}
                  </span>
                  <span className="donut-center-lbl">
                    {hoveredSlice ? hoveredSlice.name : 'Total'}
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="donut-legends">
                {categoryBreakdown.map((item, i) => (
                  <div 
                    key={i} 
                    className={`donut-legend-item ${item.name.toLowerCase()}`}
                  >
                    <span className="donut-legend-dot" />
                    <span>{item.name}</span>
                    <span className="donut-legend-val">({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feeds */}
        <div className="analytics-lists-grid">
          {/* Recent Notices Feed */}
          <div className="chart-card">
            <h3 className="chart-card-title">📋 Recent Notices</h3>
            <p className="chart-card-subtitle" style={{ marginBottom: '20px' }}>Latest announcements posted by faculty</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentNotices.length > 0 ? (
                recentNotices.map((n) => (
                  <div key={n.id} className="analytics-list-item">
                    <div className="list-item-meta">
                      <Link href={`/notices/${n.id}`} className="list-item-title">
                        {n.title}
                      </Link>
                      <p className="list-item-desc">
                        Posted {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      {n.priority === 'Urgent' ? (
                        <span className="list-item-badge urgent-badge">Urgent</span>
                      ) : (
                        <span className={`list-item-badge ${n.category.toLowerCase()}`}>
                          {n.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="list-empty-state">
                  <span className="list-empty-icon">📭</span>
                  <p>No notices posted yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Joined Students Feed */}
          <div className="chart-card">
            <h3 className="chart-card-title">🎓 New Students</h3>
            <p className="chart-card-subtitle" style={{ marginBottom: '20px' }}>Most recent student portal registrations</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentStudents.length > 0 ? (
                recentStudents.map((s) => (
                  <div key={s.id} className="analytics-list-item">
                    <div className="list-item-meta">
                      <h4 className="list-item-title">{s.name}</h4>
                      <p className="list-item-desc">
                        Joined {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="list-item-badge email-badge" title={s.email}>
                        {s.email}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="list-empty-state">
                  <span className="list-empty-icon">👥</span>
                  <p>No students registered yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ChatWidget />
    </>
  )
}
