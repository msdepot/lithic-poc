import { useEffect, useState } from 'react'
import './App.css'
import { api, setToken, getToken } from './lib/api'

function Login({ onLoggedIn }: { onLoggedIn: (role: 'crm' | 'business') => void }) {
  const [role, setRole] = useState<'crm' | 'business'>('crm')
  const [email, setEmail] = useState('admin@admin.com')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await api.post('/v1/auth/login', { email, role })
    setToken(res.data.token)
    onLoggedIn(role)
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
      <select value={role} onChange={e => setRole(e.target.value as any)}>
        <option value="crm">CRM</option>
        <option value="business">Business</option>
      </select>
      <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  )
}

function LeftNav({ setView, onLogout }: { setView: (v: string) => void, onLogout: () => void }) {
  const links = [
    { key: 'onboard', label: 'Onboard (CRM)' },
    { key: 'users', label: 'Users' },
    { key: 'cards', label: 'Cards' },
    { key: 'profiles', label: 'Profiles' },
  ]
  return (
    <div style={{ width: 220, background: '#f3f3f3', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {links.map(l => (
        <button key={l.key} onClick={() => setView(l.key)} style={{ textAlign: 'left' }}>{l.label}</button>
      ))}
      <div style={{ flex: 1 }} />
      <button onClick={onLogout}>Logout</button>
    </div>
  )
}

function Onboard() {
  const [businessName, setBusinessName] = useState('MSD Cafe')
  const [ownerEmail, setOwnerEmail] = useState('seth@merchantservicedepot.com')
  const [ownerName, setOwnerName] = useState('Eric Medina')
  const [resp, setResp] = useState<any>(null)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const r = await api.post('/v1/crm/onboard', { businessName, ownerEmail, ownerName })
    setResp(r.data)
  }
  return (
    <div style={{ padding: 12 }}>
      <h3>Onboard Business</h3>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 360 }}>
        <input placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
        <input placeholder="Owner Email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
        <input placeholder="Owner Name" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {resp && <pre>{JSON.stringify(resp, null, 2)}</pre>}
    </div>
  )
}

function Users() {
  const [list, setList] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  async function reload() { const r = await api.get('/v1/users'); setList(r.data) }
  useEffect(() => { reload() }, [])
  async function add(e: React.FormEvent) { e.preventDefault(); await api.post('/v1/users', { name, email, role }); setName(''); setEmail(''); reload() }
  return (
    <div style={{ padding: 12 }}>
      <h3>Users</h3>
      <form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="owner">owner</option>
          <option value="super_admin">super_admin</option>
          <option value="admin">admin</option>
          <option value="user">user</option>
          <option value="analyst">analyst</option>
        </select>
        <button type="submit">Add</button>
      </form>
      <pre>{JSON.stringify(list, null, 2)}</pre>
    </div>
  )
}

function Cards() {
  const [list, setList] = useState<any[]>([])
  const [userId, setUserId] = useState<number>(0)
  const [type, setType] = useState<'debit' | 'prepaid'>('debit')
  const [profileId, setProfileId] = useState<number | undefined>(undefined)
  async function reload() { const r = await api.get('/v1/cards'); setList(r.data) }
  useEffect(() => { reload() }, [])
  async function add(e: React.FormEvent) { e.preventDefault(); await api.post('/v1/cards', { userId: Number(userId), type, profileId }); reload() }
  return (
    <div style={{ padding: 12 }}>
      <h3>Cards</h3>
      <form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
        <input type="number" placeholder="User ID" value={userId} onChange={e => setUserId(Number(e.target.value))} />
        <select value={type} onChange={e => setType(e.target.value as any)}>
          <option value="debit">debit</option>
          <option value="prepaid">prepaid</option>
        </select>
        <input type="number" placeholder="Profile ID (optional)" value={profileId ?? ''} onChange={e => setProfileId(e.target.value ? Number(e.target.value) : undefined)} />
        <button type="submit">Create</button>
      </form>
      <pre>{JSON.stringify(list, null, 2)}</pre>
    </div>
  )
}

function Profiles() {
  const [list, setList] = useState<any[]>([])
  const [name, setName] = useState('')
  const [maxTx, setMaxTx] = useState<number>(0)
  const [daily, setDaily] = useState<number>(0)
  async function reload() { const r = await api.get('/v1/profiles'); setList(r.data) }
  useEffect(() => { reload() }, [])
  async function add(e: React.FormEvent) { e.preventDefault(); await api.post('/v1/profiles', { name, rules: { maxTransactionAmount: Number(maxTx) || undefined, dailyLimitAmount: Number(daily) || undefined } }); setName(''); setMaxTx(0); setDaily(0); reload() }
  return (
    <div style={{ padding: 12 }}>
      <h3>Profiles</h3>
      <form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder="Max Tx" value={maxTx} onChange={e => setMaxTx(Number(e.target.value))} />
        <input type="number" placeholder="Daily Limit" value={daily} onChange={e => setDaily(Number(e.target.value))} />
        <button type="submit">Create</button>
      </form>
      <pre>{JSON.stringify(list, null, 2)}</pre>
    </div>
  )
}

export default function App() {
  const [token, setTok] = useState<string | undefined>(getToken())
  // role is currently unused in UI; can be used for conditional menu
  const [_role, setRole] = useState<'crm' | 'business' | null>(null)
  const [view, setView] = useState('onboard')
  useEffect(() => { if (token) setToken(token) }, [token])

  if (!token) return <Login onLoggedIn={(r) => setRole(r)} />

  return (
    <div style={{ display: 'flex', height: '100vh', color: '#111' }}>
      <LeftNav setView={setView} onLogout={() => { setToken(undefined); setTok(undefined); setRole(null) }} />
      <div style={{ flex: 1, padding: 16 }}>
        {view === 'onboard' && <Onboard />}
        {view === 'users' && <Users />}
        {view === 'cards' && <Cards />}
        {view === 'profiles' && <Profiles />}
      </div>
    </div>
  )
}
