"use client";

import { useState } from "react";

export const useNotesState = () => {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [lastCreatedNote, setLastCreatedNote] = useState(null);
  const [createError, setCreateError] = useState(null);

  const updateNoteInArrays = (noteId, updatedNote) => {
    const updateFn = (notes) =>
      notes.map((note) => (note._id === noteId ? updatedNote : note));
    setNotes(updateFn);
    setAllNotes(updateFn);

    if (selectedNote?._id === noteId) {
      setSelectedNote(updatedNote);
    }
  };

  const removeNoteFromArrays = (noteId) => {
    const removeFn = (notes) => notes.filter((note) => note._id !== noteId);
    setNotes(removeFn);
    setAllNotes(removeFn);

    if (selectedNote?._id === noteId) {
      setSelectedNote(null);
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setCreateError(null);
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
  };
};
