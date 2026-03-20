import { useEffect, useRef } from 'react'

interface LogViewerProps {
  lines: string[]
  done: boolean
  error: boolean
}

function colorize(line: string): string {
  if (/error|failed|exception/i.test(line)) return 'text-red-400'
  if (/warn|warning/i.test(line)) return 'text-yellow-400'
  if (/✓|success|complete|done|applied/i.test(line)) return 'text-emerald-400'
  if (/stage|discover|enrich|score|tailor|cover|pdf/i.test(line)) return 'text-indigo-400'
  return 'text-slate-300'
}

export default function LogViewer({ lines, done, error }: LogViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines.length])

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-500">
        <span className={`w-2 h-2 rounded-full ${!done ? 'bg-emerald-500 animate-pulse' : error ? 'bg-red-500' : 'bg-slate-600'}`} />
        {!done ? 'Running...' : error ? 'Failed' : 'Completed'}
        <span className="ml-auto">{lines.length} lines</span>
      </div>
      <pre className="p-4 text-xs font-mono overflow-y-auto max-h-96 space-y-0.5">
        {lines.length === 0 && !done && (
          <span className="text-slate-600">Waiting for output...</span>
        )}
        {lines.map((line, i) => (
          <div key={i} className={colorize(line)}>{line}</div>
        ))}
        <div ref={bottomRef} />
      </pre>
    </div>
  )
}
