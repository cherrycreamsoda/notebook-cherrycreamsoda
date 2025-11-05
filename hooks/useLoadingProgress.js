"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Hook to manage loading progress for the liquid overlay
 * Simulates progress from 0-100% during loading
 */
const useLoadingProgress = (isLoading = true) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      // When loading completes, jump to 100%
      setProgress(100)
      return
    }

    // Reset progress when loading starts
    setProgress(0)

    // Simulate progress increment with diminishing returns
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          // Slow down near the end, don't reach 100 until loading actually completes
          return prev + Math.random() * 0.5
        }
        if (prev >= 80) {
          return prev + Math.random() * 1.5
        }
        if (prev >= 50) {
          return prev + Math.random() * 2.5
        }
        // Faster progress at the beginning
        return prev + Math.random() * 3 + 1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading])

  const resetProgress = useCallback(() => {
    setProgress(0)
  }, [])

  return { progress, resetProgress }
}

export default useLoadingProgress
