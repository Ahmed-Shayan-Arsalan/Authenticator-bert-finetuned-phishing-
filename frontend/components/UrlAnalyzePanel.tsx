'use client'

import { useState } from 'react'
import { Link, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react'
import SignalsBreakdown, { Signals } from './SignalsBreakdown'

interface AnalysisResult {
  label: 'phishing' | 'legitimate' | 'unknown'
  score: number
  url: string
  extracted_text: string
  signals: Signals | null
  message?: string
  red_flags?: string[]
}

export default function UrlAnalyzePanel() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isPhishing = result?.label === 'phishing'
  const isUnknown  = result?.label === 'unknown'

  const reset = () => {
    setUrl('')
    setResult(null)
    setError(null)
  }

  const analyze = async () => {
    const trimmed = url.trim()
    if (!trimmed) return

    // Basic client-side scheme guard
    if (!/^https?:\/\//i.test(trimmed)) {
      setError('Please enter a full URL starting with http:// or https://')
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('http://localhost:8000/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.detail ?? `Server error ${res.status}`)
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) analyze()
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <Link size={18} className="text-red-700 shrink-0" />
          <h1 className="text-2xl font-bold text-[#e0e0e0] tracking-tight">
            URL Analysis
          </h1>
        </div>
        <p className="text-[#777] text-sm">
          Enter a URL to fetch and analyze its page content for phishing or scam indicators.
        </p>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null) }}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          disabled={loading}
          className="flex-1 bg-[#111] border border-[#252525] rounded-xl px-4 py-2.5 text-sm text-[#d4d4d4] placeholder-[#444] focus:outline-none focus:border-red-900/60 disabled:opacity-50 transition-colors"
        />
        <button
          onClick={analyze}
          disabled={loading || !url.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Fetching…' : 'Analyze'}
        </button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 bg-red-900/10 border border-red-900/25 rounded-xl">
          <AlertTriangle className="text-red-700 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 text-sm leading-relaxed">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-8 text-center text-[#555] text-sm">
          Fetching and analyzing page content…
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div
          className={`rounded-xl border p-6 space-y-5 ${
            isUnknown
              ? 'bg-[#111] border-[#2a2a2a]'
              : isPhishing
              ? 'bg-red-900/10 border-red-900/30'
              : 'bg-[#111] border-[#2a2a2a]'
          }`}
        >
          {/* Verdict row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isPhishing
                    ? 'bg-red-900/20 border border-red-900/30'
                    : 'bg-[#1a1a1a] border border-[#2a2a2a]'
                }`}
              >
                {isPhishing ? (
                  <AlertTriangle className="text-red-600" size={18} />
                ) : (
                  <CheckCircle className="text-[#5a7a5a]" size={18} />
                )}
              </div>
              <div>
                <p
                  className={`text-lg font-bold tracking-tight ${
                    isUnknown ? 'text-[#888]' : isPhishing ? 'text-red-500' : 'text-[#6a9a6a]'
                  }`}
                >
                  {isUnknown
                    ? 'NO CONTENT FOUND'
                    : isPhishing
                    ? 'MALICIOUS DETECTED'
                    : 'APPEARS LEGITIMATE'}
                </p>
                {!isUnknown && (
                  <p className="text-xs text-[#555] mt-0.5">Confidence: {result.score}%</p>
                )}
              </div>
            </div>

            <button
              onClick={reset}
              className="text-xs text-[#444] hover:text-[#888] transition-colors flex items-center gap-1.5 border border-[#222] rounded-lg px-3 py-1.5"
            >
              <RotateCcw size={11} />
              New
            </button>
          </div>

          {/* Confidence bar */}
          {!isUnknown && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#444]">
                <span>Confidence score</span>
                <span>{result.score}%</span>
              </div>
              <div className="w-full bg-[#1e1e1e] rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${isPhishing ? 'bg-red-700' : 'bg-[#4a7a4a]'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
          )}

          {/* Analyzed URL */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#444] uppercase tracking-widest">
              Analyzed URL
            </p>
            <p className="text-[#888] text-xs font-mono bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-3 py-2 break-all">
              {result.url}
            </p>
          </div>

          {/* Extracted text preview */}
          {result.extracted_text && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-[#444] uppercase tracking-widest">
                Extracted Page Text (preview)
              </p>
              <p className="text-[#888] text-sm bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4 leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                {result.extracted_text.slice(0, 800)}{result.extracted_text.length > 800 ? '…' : ''}
              </p>
            </div>
          )}

          {/* Red Flags */}
          {result.red_flags && result.red_flags.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#444] uppercase tracking-widest">
                Why flagged
              </p>
              <ul className="space-y-1.5">
                {result.red_flags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#888] leading-relaxed">
                    <span className={`mt-1 shrink-0 text-xs ${isPhishing ? 'text-red-800' : 'text-[#4a7a4a]'}`}>—</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Signals */}
          {result.signals && <SignalsBreakdown signals={result.signals} />}

          {result.message && (
            <p className="text-[#777] text-sm italic">{result.message}</p>
          )}
        </div>
      )}
    </div>
  )
}
