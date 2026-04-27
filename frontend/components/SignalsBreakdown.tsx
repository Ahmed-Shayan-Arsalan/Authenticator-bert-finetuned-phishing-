import { Link, Phone, AlertTriangle, ShieldAlert, AlignLeft, Hash } from 'lucide-react'

export interface Signals {
  urls: string[]
  phones: string[]
  urgency_keywords: string[]
  threat_keywords: string[]
  caps_ratio: number
  exclamation_marks: number
  word_count: number
}

interface Props {
  signals: Signals
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1c1c1c] last:border-0">
      <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 text-[#555]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[#555] uppercase tracking-widest mb-1">{label}</p>
        <div className="text-sm text-[#c0c0c0]">{value}</div>
      </div>
    </div>
  )
}

function TagList({ items, color }: { items: string[]; color: string }) {
  if (!items.length) return <span className="text-[#444] text-sm">None detected</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`text-xs px-2 py-0.5 rounded border ${color}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function SignalsBreakdown({ signals }: Props) {
  const hasUrgency = signals.urgency_keywords.length > 0
  const hasThreats = signals.threat_keywords.length > 0
  const hasUrls = signals.urls.length > 0
  const hasPhones = signals.phones.length > 0
  const highCaps = signals.caps_ratio > 20

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-[#444] uppercase tracking-widest mb-2">
        Signal Breakdown
      </p>
      <div className="bg-[#0d0d0d] border border-[#1c1c1c] rounded-xl px-4 divide-y divide-[#1c1c1c]">
        <Row
          icon={<AlignLeft size={14} />}
          label="Word count"
          value={<span>{signals.word_count} words</span>}
        />
        <Row
          icon={<ShieldAlert size={14} className={hasUrgency ? 'text-red-700' : ''} />}
          label="Urgency language"
          value={
            <TagList
              items={signals.urgency_keywords}
              color="bg-red-900/20 border-red-900/40 text-red-400"
            />
          }
        />
        <Row
          icon={<AlertTriangle size={14} className={hasThreats ? 'text-red-700' : ''} />}
          label="Threat language"
          value={
            <TagList
              items={signals.threat_keywords}
              color="bg-red-900/20 border-red-900/40 text-red-400"
            />
          }
        />
        <Row
          icon={<Link size={14} className={hasUrls ? 'text-yellow-800' : ''} />}
          label="URLs detected"
          value={
            hasUrls ? (
              <div className="space-y-1">
                {signals.urls.map((url) => (
                  <p key={url} className="text-xs text-[#888] font-mono break-all">{url}</p>
                ))}
              </div>
            ) : (
              <span className="text-[#444] text-sm">None detected</span>
            )
          }
        />
        <Row
          icon={<Phone size={14} className={hasPhones ? 'text-yellow-800' : ''} />}
          label="Phone numbers"
          value={
            <TagList
              items={signals.phones}
              color="bg-[#1e1e1e] border-[#2a2a2a] text-[#888]"
            />
          }
        />
        <Row
          icon={<Hash size={14} className={highCaps ? 'text-yellow-800' : ''} />}
          label="Uppercase ratio"
          value={
            <span className={highCaps ? 'text-yellow-700' : 'text-[#555]'}>
              {signals.caps_ratio}%{highCaps ? ' — unusual capitalization' : ''}
            </span>
          }
        />
        <Row
          icon={<span className="text-[#555] text-xs font-bold">!</span>}
          label="Exclamation marks"
          value={
            <span className={signals.exclamation_marks > 2 ? 'text-yellow-700' : 'text-[#555]'}>
              {signals.exclamation_marks}
            </span>
          }
        />
      </div>
    </div>
  )
}
