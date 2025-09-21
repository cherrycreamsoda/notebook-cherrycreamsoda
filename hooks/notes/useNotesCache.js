"use client";

import { useState, useCallback } from "react";

export const useNotesCache = () => {
  const [cache, setCache] = useState(new Map());
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  const getCachedNote = useCallback(
    (noteId) => {
      if (cache.has(noteId)) {
        setCacheStats((prev) => ({ ...prev, hits: prev.hits + 1 }));
        const cachedData = cache.get(noteId);
        console.log(
          "[v0] Cache HIT for note:",
          noteId,
          "cached at:",
          cachedData.cachedAt
        );
        return cachedData.note;
      }
      setCacheStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
      console.log("[v0] Cache MISS for note:", noteId);
      return null;
    },
    [cache]
  );

  const setCachedNote = useCallback((noteId, note) => {
    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(noteId, {
        note,
        cachedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      });
      console.log(
        "[v0] Cached note:",
        noteId,
        "total cached notes:",
        newCache.size
      );
      return newCache;
    });
  }, []);

  const updateCachedNote = useCallback((noteId, updatedNote) => {
    setCache((prev) => {
      if (prev.has(noteId)) {
        const newCache = new Map(prev);
        newCache.set(noteId, {
          note: updatedNote,
          cachedAt: prev.get(noteId).cachedAt, // Keep original cache time
          lastAccessed: new Date().toISOString(),
        });
        console.log("[v0] Updated cached note:", noteId);
        return newCache;
      }
      return prev;
    });
  }, []);

  const removeCachedNote = useCallback((noteId) => {
    setCache((prev) => {
      if (prev.has(noteId)) {
        const newCache = new Map(prev);
        newCache.delete(noteId);
        console.log(
          "[v0] Removed cached note:",
          noteId,
          "remaining cached notes:",
          newCache.size
        );
        return newCache;
      }
      return prev;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
    setCacheStats({ hits: 0, misses: 0 });
    console.log("[v0] Cache cleared");
  }, []);

  const isCached = useCallback(
    (noteId) => {
      return cache.has(noteId);
    },
    [cache]
  );

  const getCacheSize = useCallback(() => {
    return cache.size;
  }, [cache]);

  const getCacheStats = useCallback(() => {
    return cacheStats;
  }, [cacheStats]);

  return {
    getCachedNote,
    setCachedNote,
    updateCachedNote,
    removeCachedNote,
    clearCache,
    isCached,
    getCacheSize,
    getCacheStats,
  };
};
