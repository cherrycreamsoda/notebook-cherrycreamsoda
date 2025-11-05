"use client";

import { useState, useEffect } from "react";
import "@styles/LoadingSpinner.css";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  message = "Loading...",
  size = 24,
  inline = false,
  showMessage = true,
  liquidAnimation = false,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (liquidAnimation) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 3 + 1; // Random increment between 1-4
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [liquidAnimation]);

  if (inline) {
    return <Loader2 size={size} className="spinner-icon-inline" />;
  }

  if (liquidAnimation) {
    return (
      <div className="liquid-loading-container">
        <div className="liquid-tank">
          <div
            className="liquid-fill"
            style={{ height: `${Math.min(progress, 100)}%` }}
          />
          <div className="liquid-percentage">
            {Math.round(Math.min(progress, 100))}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner">
      <Loader2 size={size} className="spinner-icon" />
      {showMessage && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
