// ============================================================
//  src/components/upload/FileUpload.jsx — Drag & Drop Uploader
//
//  WHY: react-dropzone gives us a battle-tested drag-and-drop
//  API. This component wraps it with our design system and
//  exposes a clean onFile(file) callback upward. All visual
//  states (idle, dragging, uploading, processing, error) are
//  handled here so the page component stays clean.
// ============================================================

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

/**
 * @param {Object}   props
 * @param {Function} props.onFile     — called with File when user drops/selects
 * @param {string}   props.uploadState — "idle"|"uploading"|"processing"|"error"
 * @param {number}   props.progress   — 0–100 upload progress
 * @param {string}   props.error      — error message or null
 * @param {Function} props.onReset    — clears error state
 */
export default function FileUpload({ onFile, uploadState, progress, error, onReset }) {
  // ── Dropzone Setup ─────────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFile(acceptedFiles[0]); // Pass the first file up to the hook
      }
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    // Disable the zone during upload/processing to prevent double-submit
    disabled: uploadState === "uploading" || uploadState === "processing",
  });

  // ── Derived Visual State ───────────────────────────────────
  const isLoading = uploadState === "uploading" || uploadState === "processing";
  const isError = uploadState === "error";

  // Dynamic border/bg classes based on state
  const zoneClasses = [
    "relative flex flex-col items-center justify-center",
    "w-full rounded-2xl border-2 border-dashed",
    "transition-all duration-300 cursor-pointer",
    "min-h-64 p-10",
    isDragActive && !isLoading
      ? "border-emerald-400 bg-emerald-950/20 drop-active scale-[1.01]"
      : isError
      ? "border-red-500/50 bg-red-950/10"
      : isLoading
      ? "border-slate-600 bg-slate-900/50 cursor-not-allowed"
      : "border-slate-700 bg-slate-900/40 hover:border-emerald-500/50 hover:bg-slate-900/60",
  ]
    .filter(Boolean)
    .join(" ");

  // ── Render ─────────────────────────────────────────────────
  return (
    <div {...getRootProps({ className: zoneClasses })}>
      {/* Hidden native file input — triggered by clicking the zone */}
      <input {...getInputProps()} />

      {/* ── Idle / Drag State ─────────────────────────────── */}
      {!isLoading && !isError && (
        <>
          {/* Animated upload icon */}
          <div
            className={`mb-5 w-16 h-16 rounded-2xl flex items-center justify-center
              ${isDragActive ? "bg-emerald-500/20" : "bg-slate-800"} transition-colors`}
          >
            <svg
              className={`w-8 h-8 transition-colors ${
                isDragActive ? "text-emerald-400" : "text-slate-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <p className="text-lg font-medium text-slate-200 mb-1">
            {isDragActive ? "Drop your statement here" : "Upload Bank Statement"}
          </p>
          <p className="text-sm text-slate-500 mb-4 text-center max-w-xs">
            Drag & drop a PDF or CSV bank statement, or click to browse
          </p>

          {/* Supported format badges */}
          <div className="flex gap-2">
            {["PDF", "CSV"].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700
                           text-slate-400 text-xs font-mono font-medium"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700
                             text-slate-500 text-xs">
              Max 10MB
            </span>
          </div>
        </>
      )}

      {/* ── Uploading State ────────────────────────────────── */}
      {uploadState === "uploading" && (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-emerald-400
                          animate-spin" />
          <div className="w-full">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Uploading file…</span>
              <span className="font-mono text-emerald-400">{progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Processing State (AI analysing) ───────────────── */}
      {uploadState === "processing" && (
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing brain/AI icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30
                            flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                />
              </svg>
            </div>
            {/* Orbiting dot to indicate AI work */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400
                            animate-bounce" />
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-medium mb-1">
              AI Analysing Transactions
            </p>
            <p className="text-slate-500 text-sm">
              Gemini is categorising your statement…
            </p>
            <p className="text-slate-600 text-xs mt-1">This may take 10–30 seconds</p>
          </div>
        </div>
      )}

      {/* ── Error State ────────────────────────────────────── */}
      {isError && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30
                          flex items-center justify-center">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-red-400 font-medium mb-1">Upload Failed</p>
            <p className="text-slate-400 text-sm max-w-xs text-center">{error}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Don't re-trigger dropzone
              onReset();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700
                       text-slate-300 hover:text-white text-sm transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}