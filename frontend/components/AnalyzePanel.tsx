'use client'

import { useState, useRef, DragEvent } from 'react'
import {
  FileImage,
  Upload,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  ScanSearch,
} from 'lucide-react'
import SignalsBreakdown, { Signals } from './SignalsBreakdown'

interface AnalysisResult {
  label: 'phishing' | 'legitimate' | 'unknown'
  score: number
  extracted_text: string
  signals: Signals | null
  message?: string
  red_flags?: string[]
}

export default function AnalyzePanel() {
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clearResult = () => {
    setResult(null)
    setError(null)
  }

  const reset = () => {
    setStagedFile(null)
    setPreview(null)
    setFileName(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const stageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP).')
      return
    }
    clearResult()
    setStagedFile(file)
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const runAnalysis = async () => {
    if (!stagedFile) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', stagedFile)

      const res = await fetch('http://localhost:8000/analyze/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.detail ?? 'Analysis failed.')
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error occurred.'
      setError(
        message.includes('fetch')
          ? 'Cannot reach the backend. Make sure it is running on port 8000.'
          : message
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) stageFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) stageFile(file)
  }

  const isPhishing = result?.label === 'phishing'
  const isUnknown = result?.label === 'unknown'

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <ScanSearch size={18} className="text-red-700 shrink-0" />
          <h1 className="text-2xl font-bold text-[#e0e0e0] tracking-tight">
            Image Analysis
          </h1>
        </div>
        <p className="text-[#777] text-sm">
          Upload a screenshot of a message, email, or letter. Text is extracted via OCR and then analyzed.
        </p>
      </div>

      {/* Upload zone — only shown when no file is staged */}
      {!stagedFile && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors select-none ${
            dragOver
              ? 'border-red-800 bg-red-900/10'
              : 'border-[#252525] hover:border-red-900/50 hover:bg-white/[0.01]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="w-14 h-14 rounded-xl bg-red-900/15 border border-red-900/25 flex items-center justify-center">
              <FileImage className="text-red-700" size={24} />
            </div>
            <div>
              <p className="text-[#c0c0c0] font-medium text-sm">Drop your image here</p>
              <p className="text-[#555] text-xs mt-1">or click to browse — PNG, JPG, WEBP</p>
            </div>
            <div className="flex items-center gap-1.5 text-[#444] text-xs mt-1">
              <Upload size={11} />
              <span>Supports screenshots, photos of letters, email previews</span>
            </div>
          </div>
        </div>
      )}

      {/* Staged image preview + action bar */}
      {stagedFile && !loading && (
        <div className="rounded-xl overflow-hidden border border-[#222]">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-[#222]">
            <div className="flex items-center gap-2 text-[#555] text-xs">
              <FileImage size={12} />
              <span className="truncate max-w-xs">{fileName}</span>
            </div>
            <button
              onClick={reset}
              className="text-[#444] hover:text-[#999] transition-colors text-xs flex items-center gap-1.5"
              title="Remove image"
            >
              <RotateCcw size={12} />
              <span>Remove</span>
            </button>
          </div>

          {/* Preview */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview!}
            alt="Uploaded preview"
            className="w-full max-h-72 object-contain bg-[#0d0d0d]"
          />

          {/* Begin Check button */}
          {!result && (
            <div className="px-4 py-3 bg-[#0f0f0f] border-t border-[#222] flex justify-end">
              <button
                onClick={runAnalysis}
                className="text-sm font-medium px-5 py-2 rounded-lg bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-900/60 transition-colors"
              >
                Begin Check
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[#222] bg-[#0f0f0f] px-4 py-8 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview!}
            alt="Uploaded preview"
            className="w-full max-h-40 object-contain opacity-40 mb-2"
          />
          <p className="text-[#555] text-sm">Extracting text and analyzing...</p>
        </div>
      )}

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
            isUnknown
              ? 'bg-[#111] border-[#2a2a2a]'
              : isPhishing
              ? 'bg-red-900/10 border-red-900/30'
              : 'bg-[#111] border-[#2a2a2a]'
          }`}
        >
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
                  {isUnknown ? 'NO TEXT FOUND' : isPhishing ? 'MALICIOUS DETECTED' : 'APPEARS LEGITIMATE'}
                </p>
                {!isUnknown && (
                  <p className="text-xs text-[#555] mt-0.5">Confidence: {result.score}%</p>
                )}
              </div>
            </div>
            {/* Re-run on a new image */}
            <button
              onClick={reset}
              className="text-xs text-[#444] hover:text-[#888] transition-colors flex items-center gap-1.5 border border-[#222] rounded-lg px-3 py-1.5"
            >
              <RotateCcw size={11} />
              New
            </button>
          </div>

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

          {result.extracted_text && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-[#444] uppercase tracking-widest">
                Extracted Text
              </p>
              <p className="text-[#888] text-sm bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4 leading-relaxed whitespace-pre-wrap break-words">
                {result.extracted_text}
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

          {result.signals && <SignalsBreakdown signals={result.signals} />}

          {result.message && (
            <p className="text-[#777] text-sm italic">{result.message}</p>
          )}
        </div>
      )}
    </div>
  )
}
