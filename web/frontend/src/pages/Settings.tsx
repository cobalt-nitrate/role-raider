import { useEffect, useState } from 'react'
import { getEnv, putEnv, getSearches, putSearches, getDoctor, getResume } from '../api/settings'

const ENV_KEYS = [
  { key: 'GEMINI_API_KEY', label: 'Gemini API Key', hint: 'Free at aistudio.google.com' },
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', hint: 'Optional alternative to Gemini' },
  { key: 'LLM_URL', label: 'Local LLM URL', hint: 'e.g. http://localhost:8080/v1 (Ollama)' },
  { key: 'LLM_MODEL', label: 'LLM Model Override', hint: 'e.g. gemini-2.0-flash or meta/llama-3.1-8b-instruct' },
  { key: 'CAPSOLVER_API_KEY', label: 'CapSolver Key', hint: 'Optional — CAPTCHA solving (~$0.001/solve)' },
  { key: 'CHROME_PATH', label: 'Chrome Path', hint: 'Auto-detected if blank' },
]

const NVIDIA_HINT = `# NVIDIA Free API (open-source models — also free!)
# 1. Sign up at build.nvidia.com
# 2. Set these two values:
LLM_URL=https://integrate.api.nvidia.com/v1
OPENAI_API_KEY=<your_nvidia_api_key>
LLM_MODEL=meta/llama-3.1-8b-instruct
# Available models: meta/llama-3.1-70b-instruct, mistralai/mistral-7b-instruct, etc.`

export default function Settings() {
  const [tab, setTab] = useState<'env' | 'searches' | 'doctor'>('env')
  const [env, setEnv] = useState<Record<string, string>>({})
  const [envDraft, setEnvDraft] = useState<Record<string, string>>({})
  const [searches, setSearches] = useState('')
  const [searchesDraft, setSearchesDraft] = useState('')
  const [doctor, setDoctor] = useState<any>(null)
  const [saved, setSaved] = useState('')
  const [resumePreview, setResumePreview] = useState('')

  useEffect(() => {
    getEnv().then((d) => { setEnv(d); setEnvDraft(Object.fromEntries(Object.entries(d).map(([k]) => [k, '']))) })
    getSearches().then((d) => { setSearches(d.content); setSearchesDraft(d.content) })
    getDoctor().then(setDoctor)
    getResume().then((d) => setResumePreview(d.preview || ''))
  }, [])

  const saveEnvKey = async (key: string) => {
    const val = envDraft[key]
    if (!val) return
    await putEnv(key, val)
    setEnv((prev) => ({ ...prev, [key]: 'set' }))
    setEnvDraft((prev) => ({ ...prev, [key]: '' }))
    setSaved(key)
    setTimeout(() => setSaved(''), 2000)
    getDoctor().then(setDoctor)
  }

  const saveSearches = async () => {
    await putSearches(searchesDraft)
    setSearches(searchesDraft)
    setSaved('searches')
    setTimeout(() => setSaved(''), 2000)
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {(['env', 'searches', 'doctor'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}>
            {t === 'env' ? 'API Keys' : t === 'searches' ? 'Searches' : 'Doctor'}
          </button>
        ))}
      </div>

      {tab === 'env' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            {ENV_KEYS.map(({ key, label, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">{label}</label>
                  {env[key] === 'set'
                    ? <span className="text-xs text-emerald-400">✓ set</span>
                    : <span className="text-xs text-slate-600">not set</span>
                  }
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder={env[key] === 'set' ? '••••••••' : 'Enter value...'}
                    value={envDraft[key] || ''}
                    onChange={(e) => setEnvDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button onClick={() => saveEnvKey(key)}
                    disabled={!envDraft[key]}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors">
                    {saved === key ? '✓' : 'Save'}
                  </button>
                </div>
                <div className="text-xs text-slate-600 mt-1">{hint}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-sm font-medium text-slate-300 mb-3">NVIDIA Free API (alternative to Gemini)</div>
            <pre className="text-xs font-mono text-slate-400 bg-slate-950 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
              {NVIDIA_HINT}
            </pre>
          </div>
        </div>
      )}

      {tab === 'searches' && (
        <div className="space-y-4">
          {resumePreview && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase mb-2">Resume Preview (first 500 chars)</div>
              <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{resumePreview}</pre>
              <div className="text-xs text-slate-600 mt-2">Edit resume.txt at ~/.role_raider/resume.txt</div>
            </div>
          )}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-sm font-medium text-slate-300">searches.yaml</div>
            <textarea
              value={searchesDraft}
              onChange={(e) => setSearchesDraft(e.target.value)}
              rows={20}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-indigo-500 resize-y"
            />
            <div className="flex gap-3">
              <button onClick={saveSearches}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                {saved === 'searches' ? '✓ Saved' : 'Save'}
              </button>
              <button onClick={() => setSearchesDraft(searches)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'doctor' && doctor && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-800 border-b border-slate-700">
              <span className="text-sm font-medium text-slate-300">
                Tier {doctor.tier} — {doctor.tier_label}
              </span>
            </div>
            <div className="divide-y divide-slate-800">
              {doctor.checks.map((c: any) => (
                <div key={c.check} className="flex items-center gap-4 px-5 py-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    c.status === 'ok' ? 'bg-emerald-500' :
                    c.status === 'missing' ? 'bg-red-500' :
                    c.status === 'warn' ? 'bg-yellow-500' : 'bg-slate-600'
                  }`} />
                  <span className="text-sm text-slate-300 w-40 shrink-0">{c.check}</span>
                  <span className={`text-xs ${
                    c.status === 'ok' ? 'text-emerald-400' :
                    c.status === 'missing' ? 'text-red-400' :
                    c.status === 'warn' ? 'text-yellow-400' : 'text-slate-500'
                  }`}>{c.status}</span>
                  <span className="text-xs text-slate-500 ml-auto text-right">{c.note}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => getDoctor().then(setDoctor)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
