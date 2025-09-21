"use client";

import { useState } from "react";
import { useNotesCache } from "./useNotesCache";

export const useNotesState = () => {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [lastCreatedNote, setLastCreatedNote] = useState(null);
  const [createError, setCreateError] = useState(null);

  const cache = useNotesCache();

  const updateNoteInArrays = (noteId, updatedNote) => {
    const updateFn = (notes) =>
      notes.map((note) => (note._id === noteId ? updatedNote : note));
    setNotes(updateFn);
    setAllNotes(updateFn);

    cache.updateCachedNote(noteId, updatedNote);

    if (selectedNote?._id === noteId && selectedNote?._id === updatedNote._id) {
      setSelectedNote(updatedNote);
    }
  };

  const removeNoteFromArrays = (noteId) => {
    const removeFn = (notes) => notes.filter((note) => note._id !== noteId);
    setNotes(removeFn);
    setAllNotes(removeFn);

    cache.removeCachedNote(noteId);

    if (selectedNote?._id === noteId) {
      setSelectedNote(null);
    }
  };

  const selectNote = async (note, fetchNoteById) => {
    if (!note) {
      console.log("[v0] Closing note - setting selectedNote to null");
      setSelectedNote(null);
      setCreateError(null);
      return null;
    }

    console.log("[v0] Selecting note:", note._id, "title:", note.title);

    // First, check if we have the full note in cache
    const cachedNote = cache.getCachedNote(note._id);

    if (cachedNote) {
      // Use cached version immediately
      setSelectedNote(cachedNote);
      setCreateError(null);
      console.log("[v0] Using cached note for selection");
      return cachedNote;
    }

    // If not in cache, check if the note from the list has full content
    // Notes from list might only have preview data
    if (
      note.content &&
      typeof note.content === "object" &&
      Object.keys(note.content).length > 0
    ) {
      // Note seems to have full content, cache it and use it
      cache.setCachedNote(note._id, note);
      setSelectedNote(note);
      setCreateError(null);
      console.log("[v0] Note has full content, cached and selected");
      return note;
    }

    // If we have a fetchNoteById function, fetch the full note
    if (fetchNoteById) {
      console.log("[v0] Fetching full note from server");
      try {
        const fullNote = await fetchNoteById(note._id);
        if (fullNote) {
          // Cache the fetched note
          cache.setCachedNote(fullNote._id, fullNote);
          setSelectedNote(fullNote);
          setCreateError(null);
          console.log("[v0] Fetched and cached full note");
          return fullNote;
        }
      } catch (error) {
        console.error("[v0] Error fetching note:", error);
      }
    }

    // Fallback: use the note as-is
    setSelectedNote(note);
    setCreateError(null);
    console.log("[v0] Using note as-is (fallback)");
    return note;
  };

  return {
    // State
    notes,
    allNotes,
    selectedNote,
    lastCreatedNote,
    createError,
    // State setters
    setNotes,
    setAllNotes,
    setSelectedNote,
    setLastCreatedNote,
    setCreateError,
    // Helper functions
    updateNoteInArrays,
    removeNoteFromArrays,
    selectNote,
    cache,
  };
};
