import { useEffect, useState, KeyboardEvent } from 'react'
import {
  getProfile, putProfile,
  getEnv, putEnv,
  getSearches, putSearches,
  getDoctor,
  getResumeFull, putResumeText,
} from '../api/settings'

// ─── Shared primitives ───────────────────────────────────────────────────────

const inp = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
const label = "block text-xs text-slate-500 mb-1"

function Field({ id, title, value, onChange, placeholder = '', type = 'text' }: {
  id: string; title: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className={label}>{title}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={inp} />
    </div>
  )
}

function Select({ title, value, onChange, options }: {
  title: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div>
      <label className={label}>{title}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={inp + ' cursor-pointer'}>
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TagInput({ title, values, onChange }: {
  title: string; values: string[]; onChange: (v: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1))
  }
  return (
    <div>
      <label className={label}>{title}</label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800 border border-slate-700 rounded-lg min-h-[2.5rem]">
        {values.map(v => (
          <span key={v} className="flex items-center gap-1 bg-indigo-600/30 text-indigo-300 text-xs px-2 py-0.5 rounded">
            {v}
            <button onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-white">×</button>
          </span>
        ))}
        <input
          value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey} onBlur={add}
          placeholder={values.length === 0 ? 'Type and press Enter' : ''}
          className="bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none flex-1 min-w-[8rem]"
        />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</div>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
}

function SaveBar({ onSave, saved, label: l = 'Save' }: { onSave: () => void; saved: boolean; label?: string }) {
  return (
    <div className="flex justify-end pt-2">
      <button onClick={onSave}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
        {saved ? '✓ Saved' : l}
      </button>
    </div>
  )
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'resume', label: 'Resume' },
  { id: 'searches', label: 'Job Searches' },
  { id: 'apikeys', label: 'API Keys' },
  { id: 'doctor', label: 'Doctor' },
] as const
type Tab = typeof TABS[number]['id']

// ─── Profile tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const empty = {
    personal: { full_name:'', preferred_name:'', email:'', phone:'', address:'', city:'', province_state:'', country:'', postal_code:'', linkedin_url:'', github_url:'', portfolio_url:'', website_url:'', password:'' },
    work_authorization: { legally_authorized_to_work:'', require_sponsorship:'', work_permit_type:'' },
    compensation: { salary_expectation:'', salary_currency:'USD', salary_range_min:'', salary_range_max:'', currency_conversion_note:'' },
    experience: { years_of_experience_total:'', education_level:'', current_title:'', target_role:'' },
    skills_boundary: { programming_languages:[] as string[], frameworks:[] as string[], tools:[] as string[] },
    resume_facts: { preserved_companies:[] as string[], preserved_projects:[] as string[], preserved_school:'', real_metrics:[] as string[] },
    eeo_voluntary: { gender:'Decline to self-identify', race_ethnicity:'Decline to self-identify', veteran_status:'I am not a protected veteran', disability_status:'I do not wish to answer' },
    availability: { earliest_start_date:'Immediately' },
  }

  const [p, setP] = useState(empty)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getProfile().then(data => { if (data && Object.keys(data).length) setP({ ...empty, ...data }) })
  }, [])

  const set = (section: string, key: string, val: any) =>
    setP(prev => ({ ...prev, [section]: { ...(prev as any)[section], [key]: val } }))

  const save = async () => {
    await putProfile(p)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Section title="Personal Information">
        <Grid>
          <Field id="full_name" title="Full Name *" value={p.personal.full_name} onChange={v => set('personal','full_name',v)} placeholder="Legal name as on ID" />
          <Field id="preferred_name" title="Preferred Name" value={p.personal.preferred_name} onChange={v => set('personal','preferred_name',v)} placeholder="Nickname (optional)" />
          <Field id="email" title="Email *" value={p.personal.email} onChange={v => set('personal','email',v)} placeholder="you@example.com" type="email" />
          <Field id="phone" title="Phone *" value={p.personal.phone} onChange={v => set('personal','phone',v)} placeholder="+1 555 000 0000" />
          <Field id="city" title="City" value={p.personal.city} onChange={v => set('personal','city',v)} placeholder="San Francisco" />
          <Field id="province_state" title="State / Province" value={p.personal.province_state} onChange={v => set('personal','province_state',v)} placeholder="CA" />
          <Field id="country" title="Country" value={p.personal.country} onChange={v => set('personal','country',v)} placeholder="United States" />
          <Field id="postal_code" title="Postal Code" value={p.personal.postal_code} onChange={v => set('personal','postal_code',v)} placeholder="94102" />
          <Field id="linkedin_url" title="LinkedIn URL" value={p.personal.linkedin_url} onChange={v => set('personal','linkedin_url',v)} placeholder="https://linkedin.com/in/..." />
          <Field id="github_url" title="GitHub URL" value={p.personal.github_url} onChange={v => set('personal','github_url',v)} placeholder="https://github.com/..." />
          <Field id="portfolio_url" title="Portfolio / Website" value={p.personal.portfolio_url} onChange={v => set('personal','portfolio_url',v)} placeholder="https://yoursite.com" />
          <div>
            <label className={label}>Job Site Password <span className="text-slate-600">(used for auto-login during apply)</span></label>
            <input type="password" value={p.personal.password} onChange={e => set('personal','password',e.target.value)}
              placeholder="••••••••" className={inp} autoComplete="new-password" />
          </div>
        </Grid>
      </Section>

      <Section title="Work Authorization">
        <Grid>
          <Select title="Legally authorized to work? *" value={p.work_authorization.legally_authorized_to_work}
            onChange={v => set('work_authorization','legally_authorized_to_work',v)}
            options={['Yes','No']} />
          <Select title="Require sponsorship?" value={p.work_authorization.require_sponsorship}
            onChange={v => set('work_authorization','require_sponsorship',v)}
            options={['Yes','No']} />
          <Field id="work_permit" title="Work Permit Type" value={p.work_authorization.work_permit_type}
            onChange={v => set('work_authorization','work_permit_type',v)}
            placeholder="Citizen, PR, H1B, OPT, etc." />
        </Grid>
      </Section>

      <Section title="Compensation">
        <Grid>
          <Field id="salary_expectation" title="Salary Expectation" value={p.compensation.salary_expectation}
            onChange={v => set('compensation','salary_expectation',v)} placeholder="95000" />
          <Select title="Currency" value={p.compensation.salary_currency}
            onChange={v => set('compensation','salary_currency',v)}
            options={['USD','CAD','GBP','EUR','INR','AUD','SGD']} />
          <Field id="salary_range_min" title="Salary Range Min" value={p.compensation.salary_range_min}
            onChange={v => set('compensation','salary_range_min',v)} placeholder="85000" />
          <Field id="salary_range_max" title="Salary Range Max" value={p.compensation.salary_range_max}
            onChange={v => set('compensation','salary_range_max',v)} placeholder="120000" />
        </Grid>
      </Section>

      <Section title="Experience & Target Role">
        <Grid>
          <Field id="current_title" title="Current Title" value={p.experience.current_title}
            onChange={v => set('experience','current_title',v)} placeholder="Software Engineer" />
          <Field id="target_role" title="Target Role *" value={p.experience.target_role}
            onChange={v => set('experience','target_role',v)} placeholder="Senior Backend Engineer" />
          <Field id="years" title="Years of Experience" value={p.experience.years_of_experience_total}
            onChange={v => set('experience','years_of_experience_total',v)} placeholder="5" />
          <Select title="Education Level" value={p.experience.education_level}
            onChange={v => set('experience','education_level',v)}
            options={["High School","Associate's Degree","Bachelor's Degree","Master's Degree","PhD","Bootcamp / Self-taught"]} />
        </Grid>
      </Section>

      <Section title="Skills">
        <TagInput title="Programming Languages" values={p.skills_boundary.programming_languages}
          onChange={v => set('skills_boundary','programming_languages',v)} />
        <TagInput title="Frameworks & Libraries" values={p.skills_boundary.frameworks}
          onChange={v => set('skills_boundary','frameworks',v)} />
        <TagInput title="Tools & Platforms" values={p.skills_boundary.tools}
          onChange={v => set('skills_boundary','tools',v)} />
      </Section>

      <Section title="Resume Facts (AI will never fabricate these)">
        <TagInput title="Companies (exact names as on your resume)" values={p.resume_facts.preserved_companies}
          onChange={v => set('resume_facts','preserved_companies',v)} />
        <TagInput title="Projects" values={p.resume_facts.preserved_projects}
          onChange={v => set('resume_facts','preserved_projects',v)} />
        <Field id="school" title="School / University" value={p.resume_facts.preserved_school}
          onChange={v => set('resume_facts','preserved_school',v)} placeholder="MIT, Stanford, etc." />
        <TagInput title="Real Metrics (e.g. '50% latency reduction', '10x throughput')" values={p.resume_facts.real_metrics}
          onChange={v => set('resume_facts','real_metrics',v)} />
      </Section>

      <Section title="Availability">
        <div className="max-w-xs">
          <Field id="start_date" title="Earliest Start Date" value={p.availability.earliest_start_date}
            onChange={v => set('availability','earliest_start_date',v)} placeholder="Immediately / 2 weeks / specific date" />
        </div>
      </Section>

      <SaveBar onSave={save} saved={saved} label="Save Profile" />
    </div>
  )
}

// ─── Resume tab ───────────────────────────────────────────────────────────────

function ResumeTab() {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResumeFull().then(d => { setContent(d.content); setLoading(false) })
  }, [])

  const save = async () => {
    await putResumeText(content)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-slate-300">Resume (plain text)</div>
            <div className="text-xs text-slate-500 mt-0.5">Used by the AI for scoring and tailoring. Paste the full text of your resume here.</div>
          </div>
          <span className="text-xs text-slate-600">{content.length} chars</span>
        </div>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={28}
            placeholder={"Paste your full resume here in plain text...\n\nJohn Doe\njohn@example.com | linkedin.com/in/johndoe\n\nEXPERIENCE\n\nSenior Engineer — Acme Corp (2021–present)\n- Built and scaled the payments API serving 10M daily transactions\n..."}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
          />
        )}
        <SaveBar onSave={save} saved={saved} label="Save Resume" />
      </div>
      <div className="text-xs text-slate-600 px-1">
        Tips: Use plain text, no tables or columns. Include company names, job titles, and metrics exactly as you want them preserved.
      </div>
    </div>
  )
}

// ─── Searches tab ─────────────────────────────────────────────────────────────

function SearchesTab() {
  const [content, setContent] = useState('')
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSearches().then(d => { setContent(d.content); setDraft(d.content) })
  }, [])

  const save = async () => {
    await putSearches(draft)
    setContent(draft); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div>
          <div className="text-sm font-medium text-slate-300">searches.yaml</div>
          <div className="text-xs text-slate-500 mt-0.5">Define what jobs to look for — titles, locations, how recent, how many per site.</div>
        </div>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={22}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-indigo-500 resize-y" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDraft(content)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
            Reset
          </button>
          <button onClick={save}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── API Keys tab ─────────────────────────────────────────────────────────────

const ENV_KEYS = [
  { key: 'GEMINI_API_KEY', label: 'Gemini API Key', hint: 'Free — get it at aistudio.google.com', link: 'https://aistudio.google.com', secret: true },
  { key: 'OPENAI_API_KEY', label: 'OpenAI / NVIDIA API Key', hint: 'OpenAI key OR your NVIDIA NIM key — both use the same field', secret: true },
  { key: 'LLM_URL', label: 'LLM Base URL', hint: 'Leave blank for OpenAI · For NVIDIA: https://integrate.api.nvidia.com/v1 · For Ollama: http://localhost:11434/v1', secret: false },
  { key: 'LLM_MODEL', label: 'Model Override', hint: 'e.g. gemini-2.0-flash · meta/llama-3.1-8b-instruct · gpt-4o-mini', secret: false },
  { key: 'CAPSOLVER_API_KEY', label: 'CapSolver API Key', hint: 'Optional — ~$0.001/CAPTCHA, needed for protected job sites', secret: true },
  { key: 'CHROME_PATH', label: 'Chrome Executable Path', hint: 'Leave blank for auto-detection', secret: false },
]

function ApiKeysTab() {
  const [env, setEnv] = useState<Record<string, string>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState('')

  useEffect(() => {
    getEnv().then(d => { setEnv(d); setDrafts(Object.fromEntries(Object.keys(d).map(k => [k, '']))) })
  }, [])

  const save = async (key: string) => {
    const val = drafts[key]?.trim()
    if (!val) return
    await putEnv(key, val)
    setEnv(prev => ({ ...prev, [key]: 'set' }))
    setDrafts(prev => ({ ...prev, [key]: '' }))
    setSaved(key); setTimeout(() => setSaved(''), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        {ENV_KEYS.map(({ key, label: lbl, hint, secret }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-300">{lbl}</label>
              {env[key] === 'set'
                ? <span className="text-xs text-emerald-400">✓ set</span>
                : <span className="text-xs text-slate-600">not set</span>}
            </div>
            <div className="flex gap-2">
              <input
                type={secret ? 'password' : 'text'}
                value={drafts[key] || ''}
                onChange={e => setDrafts(prev => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && save(key)}
                placeholder={env[key] === 'set' ? '••••••••' : 'Enter value...'}
                className={inp}
              />
              <button onClick={() => save(key)} disabled={!drafts[key]?.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors shrink-0">
                {saved === key ? '✓' : 'Save'}
              </button>
            </div>
            <div className="text-xs text-slate-600 mt-1">{hint}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-sm font-medium text-slate-300 mb-3">Using NVIDIA's free API (open-source models)</div>
        <div className="space-y-1 text-xs text-slate-400">
          <div>1. Sign up free at <span className="text-indigo-400">build.nvidia.com</span></div>
          <div>2. Set <span className="font-mono text-slate-300">OpenAI / NVIDIA API Key</span> → your NVIDIA API key</div>
          <div>3. Set <span className="font-mono text-slate-300">LLM Base URL</span> → <span className="font-mono">https://integrate.api.nvidia.com/v1</span></div>
          <div>4. Set <span className="font-mono text-slate-300">Model Override</span> → <span className="font-mono">meta/llama-3.1-8b-instruct</span></div>
        </div>
      </div>
    </div>
  )
}

// ─── Doctor tab ───────────────────────────────────────────────────────────────

function DoctorTab() {
  const [doctor, setDoctor] = useState<any>(null)
  useEffect(() => { getDoctor().then(setDoctor) }, [])

  if (!doctor) return <div className="text-slate-500 text-sm p-4">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Tier {doctor.tier} — {doctor.tier_label}</span>
          <div className="flex gap-1">
            {[1,2,3].map(t => (
              <span key={t} className={`w-2 h-2 rounded-full ${t <= doctor.tier ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-800">
          {doctor.checks.map((c: any) => (
            <div key={c.check} className="flex items-center gap-4 px-5 py-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                c.status === 'ok' ? 'bg-emerald-500' :
                c.status === 'missing' ? 'bg-red-500' :
                c.status === 'warn' ? 'bg-yellow-500' : 'bg-slate-600'
              }`} />
              <span className="text-sm text-slate-300 w-44 shrink-0">{c.check}</span>
              <span className={`text-xs w-16 shrink-0 ${
                c.status === 'ok' ? 'text-emerald-400' :
                c.status === 'missing' ? 'text-red-400' :
                c.status === 'warn' ? 'text-yellow-400' : 'text-slate-500'
              }`}>{c.status}</span>
              <span className="text-xs text-slate-500">{c.note}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => getDoctor().then(setDoctor)}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
        Refresh
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile'  && <ProfileTab />}
      {tab === 'resume'   && <ResumeTab />}
      {tab === 'searches' && <SearchesTab />}
      {tab === 'apikeys'  && <ApiKeysTab />}
      {tab === 'doctor'   && <DoctorTab />}
    </div>
  )
}
