// ============================================================
//  src/hooks/useUpload.js — File Upload Custom Hook
//
//  WHY: Custom hooks extract stateful logic from components.
//  UploadPage stays clean JSX; all the async complexity
//  (loading, error, progress, API call) lives here and is
//  fully reusable if we add a second upload entry point.
// ============================================================

import { useState, useCallback } from "react";
import { uploadStatement } from "../utils/api.js";

/**
 * Manages the full lifecycle of a file upload:
 *  idle → uploading (with progress) → processing → success / error
 *
 * @returns {{ upload, state, progress, error, reset }}
 */
export function useUpload() {
  // Possible values: "idle" | "uploading" | "processing" | "success" | "error"
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState(0);   // 0–100 upload progress
  const [error, setError] = useState(null);        // Error message string

  /**
   * Initiates the upload pipeline for a given file.
   *
   * @param {File} file
   * @returns {Promise<Object|null>} — API response data or null on error
   */
  const upload = useCallback(async (file) => {
    // Reset any previous error and start fresh
    setError(null);
    setProgress(0);
    setState("uploading");

    try {
      // Phase 1: File travels from browser → Express (multer)
      const data = await uploadStatement(file, (percent) => {
        setProgress(percent);
        // Once the file is fully uploaded, we enter "processing"
        // while Gemini does the AI analysis (can take 5–30 seconds)
        if (percent === 100) {
          setState("processing");
        }
      });

      setState("success");
      return data;
    } catch (err) {
      // Extract the most useful error message available
      const message =
        err.response?.data?.error ||    // Server sent a structured error
        err.message ||                   // Axios network error
        "Upload failed. Please try again.";

      setError(message);
      setState("error");
      return null;
    }
  }, []);

  /**
   * Resets hook state back to idle so the user can retry.
   */
  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError(null);
  }, []);

  return { upload, state, progress, error, reset };
}