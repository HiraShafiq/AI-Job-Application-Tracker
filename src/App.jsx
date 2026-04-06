import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const emptyJob = {
  company: '',
  role: '',
  location: 'Remote',
  status: 'Wishlist',
  salary_range: '',
  source: 'LinkedIn',
  job_url: '',
  job_description: '',
  notes: '',
  priority: 3,
  energy_fit: 'Morning',
  confidence_level: 5,
  date_saved: new Date().toISOString().slice(0, 10),
  date_applied: '',
  next_action_date: '',
  is_starred: false,
}

const statusColors = {
  Wishlist: '#8B5CF6',
  Applied: '#06B6D4',
  Interview: '#22C55E',
  Offer: '#F59E0B',
  Rejected: '#EF4444',
}

const motivationCopy = [
  'You are not behind, you are building a sharper story every day.',
  'One focused application can change your entire year.',
  'Your consistency is becoming visible, keep going.',
]

function App() {
  const [jobs, setJobs] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState(emptyJob)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)

  const loadData = async () => {
    setLoading(true)
    const [jobsRes, dashRes, settingsRes] = await Promise.all([
      fetch('/api/jobs'),
      fetch('/api/dashboard'),
      fetch('/api/settings'),
    ])
    const [jobsData, dashData, settingsData] = await Promise.all([
      jobsRes.json(), dashRes.json(), settingsRes.json(),
    ])
    setJobs(jobsData)
    setDashboard(dashData)
    setSettings(settingsData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((current) => (current + 1) % motivationCopy.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const funnelData = useMemo(() => {
    if (!dashboard?.funnel) return []
    return Object.entries(dashboard.funnel).map(([name, value]) => ({ name, value }))
  }, [dashboard])

  const groupedJobs = useMemo(() => {
    const groups = { Wishlist: [], Applied: [], Interview: [], Offer: [], Rejected: [] }
    jobs.forEach((job) => groups[job.status]?.push(job))
    return groups
  }, [jobs])

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      date_applied: form.date_applied || null,
      next_action_date: form.next_action_date || null,
    }

    const url = editingId ? `/api/jobs/${editingId}` : '/api/jobs'
    const method = editingId ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setForm(emptyJob)
    setEditingId(null)
    setSaving(false)
    loadData()
  }

  const editJob = (job) => {
    setEditingId(job.id)
    setForm({
      ...job,
      date_saved: job.date_saved || '',
      date_applied: job.date_applied || '',
      next_action_date: job.next_action_date || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeJob = async (id) => {
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    loadData()
  }

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: updated.user_name,
        weekly_goal: Number(updated.weekly_goal),
        top_skills: updated.top_skills,
        motivation_style: updated.motivation_style,
        energy_window: updated.energy_window,
      }),
    })
    loadData()
  }

  if (loading || !dashboard || !settings) {
    return <div className="loading-shell">Loading your momentum board...</div>
  }

  return (
    <div className="page-shell">
      <aside className="sidebar">
        <div className="brand-card glass">
          <div className="brand-badge">AI</div>
          <div>
            <h1>Job Glow Tracker</h1>
            <p>Beautifully obsessive job tracking for bold applications.</p>
          </div>
        </div>

        <div className="glass panel">
          <h3>{settings.user_name}'s momentum</h3>
          <div className="metric-stack">
            <div>
              <span>Weekly goal</span>
              <strong>{dashboard.momentum.applied_this_week}/{dashboard.momentum.weekly_goal}</strong>
            </div>
            <div>
              <span>Application streak</span>
              <strong>{dashboard.momentum.streak} day spark</strong>
            </div>
            <div>
              <span>Confidence average</span>
              <strong>{dashboard.confidence_average}/10</strong>
            </div>
          </div>
        </div>

        <div className="glass panel">
          <h3>Unique features</h3>
          <ul className="feature-list">
            <li>Momentum Engine, tracks streaks and weekly wins</li>
            <li>Ghost Risk Detector, flags where follow-up matters</li>
            <li>Skill Gap Mirror, matches your skills to each role</li>
            <li>Energy Window Planner, picks your best apply time</li>
            <li>Wins Wall, keeps your confidence from crashing</li>
          </ul>
        </div>

        <div className="glass panel motivation-panel">
          <h3>Daily spark</h3>
          <p>{motivationCopy[quoteIndex]}</p>
        </div>
      </aside>

      <main className="main-content">
        <section className="hero glass">
          <div>
            <span className="eyebrow">End-to-end React + FastAPI project</span>
            <h2>Track jobs, stay obsessed, and apply with more confidence.</h2>
            <p>
              Designed to make applying feel energizing, not draining. This interface uses dopamine-friendly color contrast,
              quick wins, and momentum loops to help you keep going.
            </p>
          </div>
          <div className="hero-cta glass-subcard">
            <span>Best application window</span>
            <strong>{dashboard.planner}</strong>
          </div>
        </section>

        <section className="grid-top">
          <div className="glass chart-card">
            <div className="section-title-row">
              <h3>Application funnel</h3>
              <span>{dashboard.momentum.completion}% of weekly goal</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {funnelData.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass chart-card">
            <div className="section-title-row">
              <h3>Status mix</h3>
              <span>See where momentum is building</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={funnelData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {funnelData.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid-mid">
          <form className="glass job-form" onSubmit={submitForm}>
            <div className="section-title-row">
              <h3>{editingId ? 'Edit application' : 'Add a dream role'}</h3>
              <span>{editingId ? 'Update and save momentum' : 'Every application starts here'}</span>
            </div>
            <div className="form-grid">
              <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
              <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input placeholder="Salary range" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.keys(statusColors).map((status) => <option key={status}>{status}</option>)}
              </select>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {['LinkedIn', 'Company Site', 'Referral', 'Indeed', 'Wellfound'].map((source) => <option key={source}>{source}</option>)}
              </select>
              <select value={form.energy_fit} onChange={(e) => setForm({ ...form, energy_fit: e.target.value })}>
                {['Morning', 'Afternoon', 'Evening', 'High Focus'].map((window) => <option key={window}>{window}</option>)}
              </select>
              <input type="number" min="1" max="5" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
              <input type="number" min="1" max="10" placeholder="Confidence" value={form.confidence_level} onChange={(e) => setForm({ ...form, confidence_level: Number(e.target.value) })} />
              <input type="date" value={form.date_saved} onChange={(e) => setForm({ ...form, date_saved: e.target.value })} />
              <input type="date" value={form.date_applied} onChange={(e) => setForm({ ...form, date_applied: e.target.value })} />
              <input type="date" value={form.next_action_date} onChange={(e) => setForm({ ...form, next_action_date: e.target.value })} />
              <input placeholder="Job URL" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} />
              <label className="checkbox-row">
                <input type="checkbox" checked={form.is_starred} onChange={(e) => setForm({ ...form, is_starred: e.target.checked })} />
                Star this dream role
              </label>
            </div>
            <textarea rows="4" placeholder="Paste the job description here for fit scoring..." value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })} />
            <textarea rows="3" placeholder="Notes, resume version, networking angle, interview prep..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="button-row">
              <button className="primary-btn" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update role' : 'Save role'}</button>
              {editingId && <button type="button" className="ghost-btn" onClick={() => { setForm(emptyJob); setEditingId(null) }}>Cancel edit</button>}
            </div>
          </form>

          <div className="glass settings-card">
            <div className="section-title-row">
              <h3>Personal edge settings</h3>
              <span>Make the tracker work for your brain</span>
            </div>
            <label>User name</label>
            <input value={settings.user_name} onChange={(e) => updateSetting('user_name', e.target.value)} />
            <label>Weekly application goal</label>
            <input type="number" value={settings.weekly_goal} onChange={(e) => updateSetting('weekly_goal', Number(e.target.value))} />
            <label>Your top skills</label>
            <textarea rows="4" value={settings.top_skills} onChange={(e) => updateSetting('top_skills', e.target.value)} />
            <label>Best energy window</label>
            <select value={settings.energy_window} onChange={(e) => updateSetting('energy_window', e.target.value)}>
              {['Morning', 'Afternoon', 'Evening'].map((window) => <option key={window}>{window}</option>)}
            </select>
            <label>Motivation style</label>
            <select value={settings.motivation_style} onChange={(e) => updateSetting('motivation_style', e.target.value)}>
              {['Bold', 'Calm', 'Luxury', 'CEO Energy'].map((style) => <option key={style}>{style}</option>)}
            </select>
          </div>
        </section>

        <section className="glass highlights-section">
          <div className="section-title-row">
            <h3>AI-style opportunity radar</h3>
            <span>These rankings are powered by your skills, priority, and follow-up timing</span>
          </div>
          <div className="highlight-grid">
            {dashboard.highlight_jobs.map((job) => (
              <article key={job.id} className="highlight-card">
                <div className="tag-row">
                  <span className="pill" style={{ background: `${statusColors[job.status]}33`, color: statusColors[job.status] }}>{job.status}</span>
                  <span className="pill dark">Fit {job.fit_score}%</span>
                  <span className="pill dark">Ghost risk {job.ghost_risk}</span>
                </div>
                <h4>{job.company}</h4>
                <p className="role-line">{job.role}</p>
                <p>{job.follow_up}</p>
                <div className="skills-block">
                  <strong>Matched skills</strong>
                  <div className="chip-row">
                    {job.matched_skills.length ? job.matched_skills.map((skill) => <span key={skill} className="chip success">{skill}</span>) : <span className="chip neutral">No direct skill match detected yet</span>}
                  </div>
                  <strong>Skill gaps</strong>
                  <div className="chip-row">
                    {job.missing_skills.length ? job.missing_skills.map((skill) => <span key={skill} className="chip warning">{skill}</span>) : <span className="chip success">Strong alignment</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass kanban-section">
          <div className="section-title-row">
            <h3>Glow board</h3>
            <span>Drag-and-drop can be added next, this version focuses on full CRUD and insight flow</span>
          </div>
          <div className="kanban-grid">
            {Object.entries(groupedJobs).map(([status, items]) => (
              <div key={status} className="kanban-column">
                <div className="kanban-header">
                  <h4>{status}</h4>
                  <span>{items.length}</span>
                </div>
                <div className="kanban-list">
                  {items.map((job) => (
                    <div key={job.id} className="job-card">
                      <div className="job-card-top">
                        <div>
                          <strong>{job.company}</strong>
                          <p>{job.role}</p>
                        </div>
                        {job.is_starred && <span className="star">★</span>}
                      </div>
                      <div className="meta-row">
                        <span>{job.location}</span>
                        <span>Priority {job.priority}</span>
                      </div>
                      <div className="meta-row">
                        <span>Confidence {job.confidence_level}/10</span>
                        <span>{job.source}</span>
                      </div>
                      <p className="small-note">{job.notes || 'No notes yet. Add one line to keep this role warm.'}</p>
                      <div className="card-actions">
                        <button className="tiny-btn" onClick={() => editJob(job)}>Edit</button>
                        <button className="tiny-btn danger" onClick={() => removeJob(job.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid-bottom">
          <div className="glass wins-card">
            <div className="section-title-row">
              <h3>Wins wall</h3>
              <span>Confidence support baked into the experience</span>
            </div>
            <ul>
              {dashboard.wins_wall.map((message, index) => <li key={index}>{message}</li>)}
            </ul>
          </div>
          <div className="glass why-unique-card">
            <div className="section-title-row">
              <h3>Why this concept stands out</h3>
              <span>Differentiating product ideas built into the MVP</span>
            </div>
            <ul>
              <li>Combines a job tracker with behavioral design to increase application consistency</li>
              <li>Surfaces energy-based apply windows instead of just static reminders</li>
              <li>Uses a skill-gap mirror to guide resume tailoring at the moment of action</li>
              <li>Prioritizes emotional momentum with a wins wall and daily spark loop</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
