import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadVideo } from '../services/api'

const ACCEPTED_EXTS = ['.mp4', '.mov', '.avi']
const MAX_MB = 500

function validateFile(file) {
  if (file.size > MAX_MB * 1024 * 1024) {
    return `File exceeds ${MAX_MB} MB limit.`
  }
  return null
}

export default function UploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(null)   // { scanId, filename }

  // Auto-navigate 2.5 s after success
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => navigate(`/dashboard?scan_id=${success.scanId}`), 2500)
    return () => clearTimeout(timer)
  }, [success, navigate])

  const pickFile = useCallback((incoming) => {
    setError('')
    const err = validateFile(incoming)
    if (err) { setError(err); return }
    setFile(incoming)
  }, [])

  // Drag & drop handlers
  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) pickFile(dropped)
  }

  // File input
  const onInputChange = (e) => {
    const chosen = e.target.files[0]
    if (chosen) pickFile(chosen)
    e.target.value = ''           // reset so same file can be re-selected
  }

  // Upload 
  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { data } = await uploadVideo(file, setProgress)
      setUploading(false)
      setSuccess({ scanId: data.scan_id, filename: file.name })
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Upload failed. Please try again.'
      setError(msg)
      setUploading(false)
    }
  }

  const reset = () => { setFile(null); setError(''); setProgress(0) }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Analyse Your Property</h1>
        <p className="mt-2 text-gray-500">
          Upload a video walkthrough — we'll detect defects, score the property, and generate a report.
        </p>
      </div>

      <div className="w-full max-w-xl space-y-4">
        {/* Drop zone */}
        {!file && !uploading && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3
              border-2 border-dashed rounded-2xl p-12 cursor-pointer
              transition-colors duration-200
              ${dragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'}
            `}
          >
            {/* Cloud upload icon */}
            <svg
              className={`w-14 h-14 ${dragging ? 'text-indigo-500' : 'text-gray-400'} transition-colors`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5A4.5 4.5 0 007.5 21h9a4.5 4.5 0 000-9h-.273A6 6 0 105.818 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6m0-6l-2 2m2-2l2 2" />
            </svg>

            <p className="text-base font-medium text-gray-700">
              {dragging ? 'Drop it here' : 'Drag & drop your video here'}
            </p>
            <p className="text-sm text-gray-400">MP4, MOV, or AVI · max {MAX_MB} MB</p>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full max-w-xs">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Browse button */}
            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium
                         hover:bg-indigo-700 active:scale-95 transition-all"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
            >
              Browse files
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTS.join(',')}
              className="hidden"
              onChange={onInputChange}
            />
          </div>
        )}

        {/*Selected file card*/}
        {file && !uploading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            {/* Video icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 10.5l4.72-2.36A.75.75 0 0121 8.868v6.264a.75.75 0 01-1.03.696L15.75 13.5M4.5 7.5h9a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 15V9a1.5 1.5 0 011.5-1.5z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>

            {/* Remove */}
            <button
              onClick={reset}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/*Upload progress*/}
        {uploading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium truncate max-w-[70%]">{file?.name}</span>
              <span className="text-indigo-600 font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">Uploading… please don't close this tab.</p>
          </div>
        )}

        {/* Success card */}
        {success && (
          <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4 animate-fade-in">
            {/* Animated circle + checkmark */}
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="absolute inset-0 w-20 h-20 animate-spin-once" viewBox="0 0 80 80">
                <circle
                  cx="40" cy="40" r="36"
                  fill="none" stroke="#22c55e" strokeWidth="4"
                  strokeDasharray="226" strokeDashoffset="0"
                  className="origin-center"
                />
              </svg>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500 animate-draw-check" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Video uploaded successfully!</p>
              <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">{success.filename}</p>
              <p className="text-xs text-gray-400 mt-3">Taking you to your dashboard…</p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/*Error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/*Action buttons */}
        <div className="flex gap-3">
          {file && !uploading && (
            <>
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-medium
                           text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Choose different file
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                           hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
              >
                Analyse Property
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
