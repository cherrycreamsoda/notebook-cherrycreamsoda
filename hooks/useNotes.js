"use client";

import { useAsyncAction } from "./useAsyncAction";
import { useNotesState } from "./notes/useNotesState";
import { useNotesLoader } from "./notes/useNotesLoader";
import { useNotesCreator } from "./notes/useNotesCreator";
import { useNotesUpdater } from "./notes/useNotesUpdater";
import { useNotesDeleter } from "./notes/useNotesDeleter";
import { useNotesComputed } from "./notes/useNotesComputed";
import { useNotesLocker } from "./notes/useNotesLocker";

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
    cache,
  } = useNotesState();

  const { loadNotes, fetchNoteById } = useNotesLoader({
    allNotes,
    selectedNote,
    setNotes,
    setAllNotes,
    setSelectedNote,
    execute,
    cache,
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

  const { setPasskey, lockNote, unlockNote } = useNotesLocker({
    allNotes,
    selectedNote,
    setAllNotes,
    setSelectedNote,
    updateNoteInArrays,
    execute,
  });

  const { counts } = useNotesComputed({ allNotes });

  const handleSelectNote = async (note) => {
    return await selectNote(note, fetchNoteById);
  };

  return {
    notes,
    allNotes,
    selectedNote,
    setSelectedNote: handleSelectNote,
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
    cache,
    setPasskey,
    lockNote,
    unlockNote,
  };
};
