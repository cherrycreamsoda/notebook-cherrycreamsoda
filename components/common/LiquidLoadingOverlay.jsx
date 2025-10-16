"use client"

import { useState, useEffect } from "react"
import "@styles/LiquidLoadingOverlay.css"

const LiquidLoadingOverlay = ({ isLoading = true, progress = 0, onLoadingComplete = () => {} }) => {
  const [isVisible, setIsVisible] = useState(isLoading)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [shouldRender, setShouldRender] = useState(isLoading)

  // Handle loading completion and fade-out animation
  useEffect(() => {
    if (!isLoading && isVisible) {
      // Start fade-out animation
      setIsFadingOut(true)

      // Wait for fade-out animation to complete before unmounting
      const fadeOutTimer = setTimeout(() => {
        setIsVisible(false)
        setShouldRender(false)
        onLoadingComplete()
      }, 1000) // Match the CSS fade-out duration

      return () => clearTimeout(fadeOutTimer)
    }
  }, [isLoading, isVisible, onLoadingComplete])

  // Update render state when loading starts
  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
      setIsVisible(true)
      setIsFadingOut(false)
    }
  }, [isLoading])

  if (!shouldRender) {
    return null
  }

  return (
    <div className={`liquid-overlay ${isVisible ? "visible" : ""} ${isFadingOut ? "fade-out" : ""}`}>
      <div className="liquid-tank-overlay">
        <div className="liquid-fill-overlay" style={{ height: `${Math.min(progress, 100)}%` }} />
        <div className="liquid-percentage-overlay">{Math.round(Math.min(progress, 100))}%</div>
      </div>
    </div>
  )
}

export default LiquidLoadingOverlay
