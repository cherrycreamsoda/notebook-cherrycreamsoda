"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@styles/PasscodeOverlay.module.css";

const PasscodeOverlay = ({
  onPasscodeEntered,
  onDismiss,
  message,
  isError,
}) => {
  const [passcode, setPasscode] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(message);
  const [showError, setShowError] = useState(isError);
  const inputRef = useRef(null);

  useEffect(() => {
    setFeedbackMessage(message);
    setShowError(isError);
    if (isError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setFeedbackMessage("");
        setPasscode([]);
      }, 4000); // Reset after 4 seconds for "Try Again"
      return () => clearTimeout(timer);
    }
  }, [message, isError]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onDismiss();
      } else if (event.key >= "0" && event.key <= "9" && passcode.length < 6) {
        setPasscode((prev) => [...prev, event.key]);
      } else if (event.key === "Backspace" && passcode.length > 0) {
        setPasscode((prev) => prev.slice(0, prev.length - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [passcode, onDismiss]);

  useEffect(() => {
    if (passcode.length === 6) {
      onPasscodeEntered(passcode.join(""));
    }
  }, [passcode, onPasscodeEntered]);

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.passcodeCircles}>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`${styles.circle} ${
                passcode.length > index ? styles.filled : ""
              } ${showError ? styles.error : ""}`}
            ></div>
          ))}
        </div>
        {feedbackMessage && (
          <div
            className={`${styles.feedbackMessage} ${
              showError ? styles.errorMessage : ""
            }`}
          >
            {feedbackMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasscodeOverlay;
