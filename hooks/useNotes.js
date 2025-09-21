"use client";

import { useAsyncAction } from "./useAsyncAction";
import { useNotesState } from "./notes/useNotesState";
import { useNotesLoader } from "./notes/useNotesLoader";
import { useNotesCreator } from "./notes/useNotesCreator";
import { useNotesUpdater } from "./notes/useNotesUpdater";
import { useNotesDeleter } from "./notes/useNotesDeleter";
import { useNotesComputed } from "./notes/useNotesComputed";

export const useNotes = () => {
  const { loading, error, execute, clearError } = useAsyncAction();

  const {
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
  } = useNotesState();

  const { loadNotes, fetchNoteById } = useNotesLoader({
    allNotes,
    selectedNote,
    setNotes,
    setAllNotes,
    setSelectedNote,
    execute,
  });

  const { createNote } = useNotesCreator({
    lastCreatedNote,
    setNotes,
    setAllNotes,
    setSelectedNote,
    setLastCreatedNote,
    setCreateError,
    execute,
  });

  const { updateNote, togglePin } = useNotesUpdater({
    lastCreatedNote,
    setLastCreatedNote,
    updateNoteInArrays,
    execute,
  });

  const { deleteNote, permanentDelete, restoreNote, clearAllDeleted } =
    useNotesDeleter({
      allNotes,
      notes,
      selectedNote,
      lastCreatedNote,
      setAllNotes,
      setSelectedNote,
      setLastCreatedNote,
      setCreateError,
      updateNoteInArrays,
      removeNoteFromArrays,
      execute,
    });

  const { counts } = useNotesComputed({ allNotes });

  return {
    notes,
    allNotes,
    selectedNote,
    setSelectedNote: selectNote,
    counts,
    loading,
    error,
    createError,
    clearError: () => {
      clearError();
      setCreateError(null);
    },
    loadNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    permanentDelete,
    restoreNote,
    togglePin,
    clearAllDeleted,
  };
};
