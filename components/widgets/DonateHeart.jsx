"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import styles from "@styles/DonateHeart.module.css";

const DonateHeart = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [isBeating, setIsBeating] = useState(false);
  const [selectedChain, setSelectedChain] = useState("ETH");
  const [isShaking, setIsShaking] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const holdTimerRef = useRef(null);
  const holdStartTimeRef = useRef(null);
  const audioRef = useRef(null);
  const holdDurationRef = useRef(0);

  useEffect(() => {
    const brokenStatus = localStorage.getItem("donateHeartBroken");
    if (brokenStatus === "true") {
      setIsBroken(true);
    }

    const audio = new Audio("/donate-beat-sound.mp3");
    audio.volume = 0.6;
    audioRef.current = audio;
  }, []);

  const playBeatSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const triggerBeat = useCallback(() => {
    setIsBeating(true);
    playBeatSound();
    setTimeout(() => setIsBeating(false), 600);
  }, [playBeatSound]);

  const handleMouseDown = useCallback(() => {
    if (isBroken || isOpen) return;

    holdStartTimeRef.current = Date.now();
    holdDurationRef.current = 0;

    holdTimerRef.current = setInterval(() => {
      holdDurationRef.current = Date.now() - holdStartTimeRef.current;

      if (holdDurationRef.current >= 1500 && !isShaking) {
        setIsShaking(true);
      }

      if (holdDurationRef.current >= 2000) {
        breakHeart();
        clearInterval(holdTimerRef.current);
        setIsShaking(false);
      }
    }, 50);
  }, [isBroken, isOpen, isShaking]);

  const handleMouseUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);

      if (holdDurationRef.current < 1500 && !isBroken && !isOpen) {
        triggerBeat();
        setIsOpen(true);
      }

      setIsShaking(false);
    }
  }, [isBroken, isOpen, triggerBeat]);

  const breakHeart = useCallback(() => {
    setIsBreaking(true);
    setTimeout(() => {
      setIsBroken(true);
      localStorage.setItem("donateHeartBroken", "true");
    }, 600);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (isBroken) {
    return null;
  }

  return (
    <>
      <button
        className={`${styles.heartButton} ${isBeating ? styles.beating : ""} ${
          isShaking ? styles.shaking : ""
        } ${isBreaking ? styles.breaking : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        aria-label="Donate to support"
        title="Click to donate"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {isOpen && (
        <DonateQRModal
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          onClose={closeModal}
        />
      )}
    </>
  );
});

DonateHeart.displayName = "DonateHeart";

const DonateQRModal = memo(({ selectedChain, onChainChange, onClose }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleClose = useCallback(() => {
    setFadeOut(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const addresses = {
    ETH: "0x1234567890123456789012345678901234567890",
    BTC: "1A1z7agoat2YMMXX7th9A2XQ7BuQF4Dv7",
    USDT: "0x1234567890123456789012345678901234567890",
  };

  return (
    <>
      <div
        className={`${styles.blurOverlay} ${fadeOut ? styles.fadeOut : ""}`}
        onClick={handleClose}
      />

      <div
        className={`${styles.qrModal} ${fadeOut ? styles.slideDown : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
          </svg>
        </button>

        <div className={styles.chainTabs}>
          {["ETH", "BTC", "USDT"].map((chain) => (
            <button
              key={chain}
              className={`${styles.chainTab} ${
                selectedChain === chain ? styles.active : ""
              }`}
              onClick={() => onChainChange(chain)}
            >
              {chain}
            </button>
          ))}
        </div>

        <div className={styles.qrContainer}>
          {selectedChain === "ETH" && (
            <svg
              viewBox="0 0 290 290"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="290" height="290" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="black" />
              <rect x="20" y="20" width="10" height="10" fill="white" />
              <rect x="50" y="10" width="10" height="10" fill="black" />
              <rect x="70" y="10" width="10" height="10" fill="black" />
              <rect x="90" y="10" width="10" height="10" fill="black" />
              <rect x="110" y="10" width="10" height="10" fill="black" />
              <rect x="130" y="10" width="10" height="10" fill="black" />
              <rect x="150" y="10" width="10" height="10" fill="black" />
              <rect x="170" y="10" width="10" height="10" fill="black" />
              <rect x="190" y="10" width="10" height="10" fill="black" />
              <rect x="210" y="10" width="30" height="30" fill="black" />
              <rect x="220" y="20" width="10" height="10" fill="white" />
              <rect x="10" y="50" width="10" height="10" fill="black" />
              <rect x="30" y="50" width="10" height="10" fill="black" />
              <rect x="50" y="50" width="10" height="10" fill="black" />
              <rect x="70" y="50" width="10" height="10" fill="black" />
              <rect x="130" y="50" width="10" height="10" fill="black" />
              <rect x="150" y="50" width="10" height="10" fill="black" />
              <rect x="210" y="50" width="10" height="10" fill="black" />
              <rect x="230" y="50" width="10" height="10" fill="black" />
              <rect x="250" y="50" width="10" height="10" fill="black" />
              <rect x="270" y="50" width="10" height="10" fill="black" />
              <rect x="10" y="70" width="30" height="10" fill="black" />
              <rect x="20" y="80" width="10" height="10" fill="white" />
              <rect x="50" y="70" width="10" height="10" fill="black" />
              <rect x="70" y="70" width="10" height="10" fill="black" />
              <rect x="90" y="70" width="10" height="10" fill="black" />
              <rect x="110" y="70" width="10" height="10" fill="black" />
              <rect x="130" y="70" width="10" height="10" fill="black" />
              <rect x="150" y="70" width="10" height="10" fill="black" />
              <rect x="210" y="70" width="30" height="10" fill="black" />
              <rect x="220" y="80" width="10" height="10" fill="white" />
            </svg>
          )}
          {selectedChain === "BTC" && (
            <svg
              viewBox="0 0 290 290"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="290" height="290" fill="white" />
              <text
                x="145"
                y="160"
                textAnchor="middle"
                fontSize="120"
                fontWeight="bold"
                fill="black"
              >
                ₿
              </text>
            </svg>
          )}
          {selectedChain === "USDT" && (
            <svg
              viewBox="0 0 290 290"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="290" height="290" fill="white" />
              <text
                x="145"
                y="160"
                textAnchor="middle"
                fontSize="120"
                fontWeight="bold"
                fill="black"
              >
                ₮
              </text>
            </svg>
          )}
        </div>

        <div className={styles.addressDisplay}>
          <div className={styles.addressBox}>
            <code>{addresses[selectedChain]}</code>
            <button
              className={styles.copyButton}
              onClick={() => {
                navigator.clipboard.writeText(addresses[selectedChain]);
              }}
              title="Copy address"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" />
                <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

DonateQRModal.displayName = "DonateQRModal";

export default DonateHeart;
