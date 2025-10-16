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
  const [isDismissing, setIsDismissing] = useState(false);
  const inputRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    setFeedbackMessage(message);
    setShowError(isError);
    if (isError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setFeedbackMessage("");
        setPasscode([]);
        submittedRef.current = false;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, isError]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleDismiss();
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
  }, [passcode]);
  useEffect(() => {
    if (passcode.length === 6 && !submittedRef.current) {
      submittedRef.current = true;
      onPasscodeEntered(passcode.join(""));
    }
  }, [passcode]);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      submittedRef.current = false;
      setPasscode([]);
      setFeedbackMessage("");
      setShowError(false);
      onDismiss();
    }, 300);
  };

  return (
    <div
      className={`${styles.overlay} ${
        isDismissing ? styles.passcodeOverlayFadeOut : ""
      }`}
      onClick={handleDismiss}
    >
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
