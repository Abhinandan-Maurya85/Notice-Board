import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts"

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return "—"
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const PRIORITY_COLORS = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  NORMAL: "#3b82f6",
  LOW: "#6b7280",
}

const PRIORITY_LABELS = {
  URGENT: "Urgent",
  HIGH: "High",
  NORMAL: "Normal",
  LOW: "Low",
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] ?? "#6b7280"
  const label = PRIORITY_LABELS[priority] ?? priority
  return (
    <span className="badge" style={{ background: color + "18", color }}>
      {label}
    </span>
  )
}

function CategoryChip({ category }) {
  return <span className="chip">{category}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview") // overview | notices | students

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Head>
        <title>Analytics · Notice Board</title>
      </Head>

      <div className="page">
        {/* ── Header ── */}
        <header className="dash-header">
          <div className="dash-header-inner">
            <div>
              <p className="dash-eyebrow">Faculty Portal</p>
              <h1 className="dash-title">Analytics</h1>
            </div>
            <div className="dash-header-actions">
              <Link href="/notices/create" className="btn-primary">
                + New Notice
              </Link>
              <Link href="/notices" className="btn-ghost">
                All Notices
              </Link>
            </div>
          </div>

          {/* Tab bar */}
          <div className="tab-bar">
            {["overview", "notices", "students"].map((t) => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <main className="dash-main">
          {/* ── Loading ── */}
          {loading && (
            <div className="state-center">
              <div className="spinner" />
              <p>Loading analytics…</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="state-center">
              <div className="error-box">
                <span className="error-icon">⚠</span>
                <p>{error}</p>
                <button className="btn-primary" onClick={() => location.reload()}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* ── Dashboard ── */}
          {data && (
            <>
              {/* ══ OVERVIEW TAB ══ */}
              {activeTab === "overview" && (
                <div className="tab-content">

                  {/* Stat cards */}
                  <section className="stat-grid">
                    <StatCard
                      icon="📋"
                      label="Total Notices"
                      value={fmt(data.totalNotices)}
                      sub={`${data.urgentNotices} urgent`}
                      accent="#3b82f6"
                    />
                    <StatCard
                      icon="👁"
                      label="Total Views"
                      value={fmt(data.totalViews)}
                      sub={`${data.avgViewsPerNotice} avg per notice`}
                      accent="#8b5cf6"
                    />
                    <StatCard
                      icon="📖"
                      label="Read Rate"
                      value={`${data.readRate}%`}
                      sub={`${data.totalUniqueViewers} unique readers`}
                      accent="#10b981"
                    />
                    <StatCard
                      icon="🔖"
                      label="Bookmarks"
                      value={fmt(data.totalBookmarks)}
                      sub={`across ${data.totalStudents} students`}
                      accent="#f59e0b"
                    />
                  </section>

                  {/* Read-rate progress bar — the signature element */}
                  <section className="readrate-section">
                    <div className="readrate-header">
                      <span className="section-label">Notice reach this week</span>
                      <span className="readrate-pct">{data.readRate}% read</span>
                    </div>
                    <div className="readrate-track">
                      <div
                        className="readrate-fill"
                        style={{ width: `${data.readRate}%` }}
                      />
                    </div>
                    <div className="readrate-meta">
                      <span>{data.totalUniqueViewers} unique readers</span>
                      <span>{data.totalStudents} total students</span>
                    </div>
                  </section>

                  {/* Charts row */}
                  <div className="charts-row">

                    {/* Area chart — 7-day activity */}
                    <section className="chart-card wide">
                      <h2 className="chart-title">7-day activity</h2>
                      <p className="chart-sub">Notices posted vs. views per day</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.activityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gNotices" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="views" name="Views" stroke="#8b5cf6" strokeWidth={2} fill="url(#gViews)" dot={false} activeDot={{ r: 4 }} />
                          <Area type="monotone" dataKey="notices" name="Notices" stroke="#3b82f6" strokeWidth={2} fill="url(#gNotices)" dot={false} activeDot={{ r: 4 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </section>

                    {/* Pie chart — category breakdown */}
                    <section className="chart-card">
                      <h2 className="chart-title">By category</h2>
                      <p className="chart-sub">Notice distribution</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={data.categoryBreakdown}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                          >
                            {data.categoryBreakdown.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v, n) => [v, n]} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(v) => <span style={{ fontSize: 12, color: "#6b7280" }}>{v}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </section>

                    {/* Bar chart — priority breakdown */}
                    <section className="chart-card">
                      <h2 className="chart-title">By priority</h2>
                      <p className="chart-sub">Urgency distribution</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={data.priorityBreakdown}
                          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                          barSize={28}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                            tickFormatter={(v) => PRIORITY_LABELS[v] ?? v}
                          />
                          <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v, n) => [v, "Notices"]} labelFormatter={(l) => PRIORITY_LABELS[l] ?? l} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.priorityBreakdown.map((entry, i) => (
                              <Cell key={i} fill={PRIORITY_COLORS[entry.name] ?? "#94a3b8"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </section>
                  </div>

                  {/* Top notices */}
                  <section className="table-card">
                    <h2 className="chart-title">Top notices by views</h2>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Views</th>
                            <th>Bookmarks</th>
                            <th>Posted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.topNotices.map((n, i) => (
                            <tr key={n.id}>
                              <td className="rank">{i + 1}</td>
                              <td>
                                <Link href={`/notices/${n.id}`} className="notice-link">
                                  {n.title}
                                </Link>
                              </td>
                              <td><CategoryChip category={n.category} /></td>
                              <td><PriorityBadge priority={n.priority} /></td>
                              <td className="num">{fmt(n.viewCount)}</td>
                              <td className="num">{n.bookmarkCount}</td>
                              <td className="muted">{timeAgo(n.createdAt)}</td>
                            </tr>
                          ))}
                          {data.topNotices.length === 0 && (
                            <tr>
                              <td colSpan={7} className="empty-row">
                                No notices yet — <Link href="/notices/create">post one</Link>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {/* ══ NOTICES TAB ══ */}
              {activeTab === "notices" && (
                <div className="tab-content">
                  <section className="table-card">
                    <div className="table-header-row">
                      <h2 className="chart-title">Recent notices</h2>
                      <Link href="/notices/create" className="btn-primary small">
                        + New
                      </Link>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Views</th>
                            <th>Posted</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recentNotices.map((n) => (
                            <tr key={n.id}>
                              <td>
                                <Link href={`/notices/${n.id}`} className="notice-link">
                                  {n.title}
                                </Link>
                              </td>
                              <td><CategoryChip category={n.category} /></td>
                              <td><PriorityBadge priority={n.priority} /></td>
                              <td className="num">{fmt(n.viewCount)}</td>
                              <td className="muted">{timeAgo(n.createdAt)}</td>
                              <td>
                                <Link href={`/notices/${n.id}`} className="action-link">
                                  View →
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {/* ══ STUDENTS TAB ══ */}
              {activeTab === "students" && (
                <div className="tab-content">
                  <div className="stat-grid small">
                    <StatCard
                      icon="🎓"
                      label="Total Students"
                      value={fmt(data.totalStudents)}
                      accent="#3b82f6"
                    />
                    <StatCard
                      icon="👁"
                      label="Active Readers"
                      value={fmt(data.totalUniqueViewers)}
                      sub="viewed at least one notice"
                      accent="#8b5cf6"
                    />
                    <StatCard
                      icon="📖"
                      label="Engagement Rate"
                      value={`${data.readRate}%`}
                      sub="students who read notices"
                      accent="#10b981"
                    />
                  </div>

                  <section className="table-card">
                    <h2 className="chart-title">Recently joined students</h2>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recentStudents.map((s) => (
                            <tr key={s.id}>
                              <td>
                                <div className="avatar-row">
                                  <div className="avatar">
                                    {s.name?.[0]?.toUpperCase() ?? "?"}
                                  </div>
                                  {s.name}
                                </div>
                              </td>
                              <td className="muted">{s.email}</td>
                              <td className="muted">{timeAgo(s.createdAt)}</td>
                            </tr>
                          ))}
                          {data.recentStudents.length === 0 && (
                            <tr>
                              <td colSpan={3} className="empty-row">
                                No students registered yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        /* ── Tokens ── */
        :root {
          --bg: #f8f9fc;
          --surface: #ffffff;
          --border: #e5e7eb;
          --text: #111827;
          --muted: #6b7280;
          --radius: 12px;
          --shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
        }

        /* ── Layout ── */
        .page {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Inter', sans-serif;
          color: var(--text);
        }

        /* ── Header ── */
        .dash-header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .dash-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 24px 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .dash-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 4px;
        }
        .dash-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .dash-header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          padding-top: 6px;
        }

        /* ── Tabs ── */
        .tab-bar {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          gap: 4px;
          margin-top: 16px;
        }
        .tab-btn {
          padding: 8px 16px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }
        .tab-btn:hover:not(.active) {
          color: var(--text);
        }

        /* ── Main ── */
        .dash-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 24px 64px;
        }
        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Stat cards ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-grid.small {
          grid-template-columns: repeat(3, 1fr);
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          box-shadow: var(--shadow);
          border-left: 3px solid var(--accent);
          transition: transform 0.15s;
        }
        .stat-card:hover {
          transform: translateY(-1px);
        }
        .stat-icon {
          font-size: 22px;
          line-height: 1;
          margin-top: 2px;
        }
        .stat-body {
          flex: 1;
          min-width: 0;
        }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: var(--accent);
        }
        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-top: 4px;
        }
        .stat-sub {
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* ── Read-rate bar (signature element) ── */
        .readrate-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px 24px;
          box-shadow: var(--shadow);
        }
        .readrate-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 10px;
        }
        .readrate-pct {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #10b981;
        }
        .readrate-track {
          height: 8px;
          background: #f0fdf4;
          border-radius: 99px;
          overflow: hidden;
        }
        .readrate-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 99px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .readrate-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--muted);
          margin-top: 6px;
        }

        /* ── Charts ── */
        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
        }
        .chart-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow);
        }
        .chart-card.wide {
          /* taken care of by grid */
        }
        .chart-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 2px;
        }
        .chart-sub {
          font-size: 12px;
          color: var(--muted);
          margin: 0 0 16px;
        }
        .chart-tooltip {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          box-shadow: var(--shadow);
        }
        .tooltip-label {
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--text);
        }
        .chart-tooltip p {
          margin: 2px 0;
        }

        /* ── Tables ── */
        .table-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow);
        }
        .table-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .table-header-row .chart-title {
          margin: 0;
        }
        .table-wrap {
          overflow-x: auto;
          margin-top: 12px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .data-table th {
          text-align: left;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        .data-table td {
          padding: 11px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .data-table tr:last-child td {
          border-bottom: none;
        }
        .data-table tr:hover td {
          background: #f9fafb;
        }
        .rank {
          color: var(--muted);
          font-weight: 700;
          font-size: 12px;
          width: 28px;
        }
        .num {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
        }
        .muted {
          color: var(--muted);
          font-size: 12px;
        }
        .empty-row {
          text-align: center;
          color: var(--muted);
          padding: 32px 12px;
        }

        /* ── Badges / chips ── */
        .badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 99px;
          white-space: nowrap;
        }
        .chip {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #374151;
          white-space: nowrap;
        }

        /* ── Avatar ── */
        .avatar-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }
        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Buttons ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: #3b82f6;
          color: #fff;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #2563eb; }
        .btn-primary.small { padding: 6px 12px; font-size: 12px; }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: transparent;
          color: var(--muted);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .btn-ghost:hover { color: var(--text); border-color: #9ca3af; }

        .notice-link {
          color: var(--text);
          text-decoration: none;
          font-weight: 500;
        }
        .notice-link:hover { color: #3b82f6; }
        .action-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
        }
        .section-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── States ── */
        .state-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40vh;
          gap: 16px;
          color: var(--muted);
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius);
          padding: 32px 40px;
          color: #991b1b;
        }
        .error-icon { font-size: 28px; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .stat-grid.small { grid-template-columns: 1fr; }
          .dash-header-inner { flex-direction: column; }
          .dash-header-actions { width: 100%; }
        }
      `}</style>
    </>
  )
}