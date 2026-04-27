'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Type } from 'lucide-react'
import SignalsBreakdown, { Signals } from './SignalsBreakdown'

interface AnalysisResult {
  label: 'phishing' | 'legitimate'
  score: number
  input_text: string
  signals: Signals
}

const PLACEHOLDER =
  'Paste a suspicious message, email body, or SMS here...\n\nExample: "Your E-ZPass account has an outstanding balance of $34.50. Failure to pay within 24 hours will result in license suspension. Pay now at ezpass-payment.net"'

export default function TextAnalyzePanel() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setResult(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    reset()
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.detail ?? 'Analysis failed.')
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error.'
      setError(
        message.includes('fetch')
          ? 'Cannot reach the backend. Make sure it is running on port 8000.'
          : message
      )
    } finally {
      setLoading(false)
    }
  }

  const isPhishing = result?.label === 'phishing'
  const charCount = text.length

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <Type size={18} className="text-red-700 shrink-0" />
          <h1 className="text-2xl font-bold text-[#e0e0e0] tracking-tight">
            Text Analysis
          </h1>
        </div>
        <p className="text-[#777] text-sm">
          Paste any message, email, or SMS content to check for phishing indicators.
        </p>
      </div>

      {/* Text input */}
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); reset() }}
          placeholder={PLACEHOLDER}
          rows={10}
          maxLength={10000}
          className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-[#d4d4d4] placeholder-[#444] resize-none focus:outline-none focus:border-red-900/60 transition-colors leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#444]">
            {charCount.toLocaleString()} / 10,000 characters
          </span>
          <div className="flex gap-2">
            {text && (
              <button
                onClick={() => { setText(''); reset() }}
                className="text-xs text-[#555] hover:text-[#999] transition-colors px-3 py-1.5 rounded-lg border border-[#222] hover:border-[#333]"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              className="text-xs font-medium px-4 py-1.5 rounded-lg bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 bg-red-900/10 border border-red-900/25 rounded-xl">
          <AlertTriangle className="text-red-700 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 text-sm leading-relaxed">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div
          className={`rounded-xl border p-6 space-y-5 ${
            isPhishing
              ? 'bg-red-900/10 border-red-900/30'
              : 'bg-[#111] border-[#2a2a2a]'
          }`}
        >
          {/* Verdict row */}
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isPhishing ? 'bg-red-900/20 border border-red-900/30' : 'bg-[#1a1a1a] border border-[#2a2a2a]'
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
                  isPhishing ? 'text-red-500' : 'text-[#6a9a6a]'
                }`}
              >
                {isPhishing ? 'MALICIOUS DETECTED' : 'APPEARS LEGITIMATE'}
              </p>
              <p className="text-xs text-[#555] mt-0.5">
                Confidence: {result.score}%
              </p>
            </div>
          </div>

          {/* Confidence bar */}
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

          {/* Signals */}
          {result.signals && <SignalsBreakdown signals={result.signals} />}
        </div>
      )}
    </div>
  )
}
