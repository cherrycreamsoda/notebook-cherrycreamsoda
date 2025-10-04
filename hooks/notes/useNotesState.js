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
      console.log("Closing note - setting selectedNote to null");
      setSelectedNote(null);
      setCreateError(null);
      return null;
    }

    console.log("Selecting note:", note._id, "title:", note.title);

    if (note.locked) {
      const safeLocked = {
        ...note,
        content: "Note is Locked",
        rawContent: "",
      };
      cache.setCachedNote(note._id, safeLocked);
      setSelectedNote(safeLocked);
      setCreateError(null);
      console.log("Selected locked note as safe/blanked");
      return safeLocked;
    }

    const cachedNote = cache.getCachedNote(note._id);

    if (cachedNote) {
      setSelectedNote(cachedNote);
      setCreateError(null);
      console.log("Using cached note for selection");
      return cachedNote;
    }

    if (
      note.content &&
      typeof note.content === "object" &&
      Object.keys(note.content).length > 0
    ) {
      cache.setCachedNote(note._id, note);
      setSelectedNote(note);
      setCreateError(null);
      console.log("Note has full content, cached and selected");
      return note;
    }

    if (fetchNoteById) {
      console.log("Fetching full note from server");
      try {
        const fullNote = await fetchNoteById(note._id);
        if (fullNote) {
          cache.setCachedNote(fullNote._id, fullNote);
          setSelectedNote(fullNote);
          setCreateError(null);
          console.log("Fetched and cached full note");
          return fullNote;
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    }

    setSelectedNote(note);
    setCreateError(null);
    console.log("Using note as-is (fallback)");
    return note;
  };

  return {
    notes,
    allNotes,
    selectedNote,
    lastCreatedNote,
    createError,

    setNotes,
    setAllNotes,
    setSelectedNote,
    setLastCreatedNote,
    setCreateError,

    updateNoteInArrays,
    removeNoteFromArrays,
    selectNote,
    cache,
  };
};
