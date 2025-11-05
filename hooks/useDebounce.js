"use client";

import { useEffect } from "react";

import { useRef, useCallback } from "react";

export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const debouncedCallback = useCallback(
    (...args) => {
      clearTimer();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [delay]
  );

  debouncedCallback.cancel = () => {
    clearTimer();
  };

  const cleanup = useCallback(() => {
    clearTimer();
  }, []);

  return { debouncedCallback, cleanup };
};
