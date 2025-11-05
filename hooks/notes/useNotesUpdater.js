"use client";

import { notesAPI } from "@lib/services/api";

export const useNotesUpdater = ({
  lastCreatedNote,
  setLastCreatedNote,
  updateNoteInArrays,
  execute,
  allNotes,
  notes,
  setCreateError,
  selectedNote,
}) => {
  const updateNote = async (id, updates) => {
    return execute(async () => {
      const updatedNote = await notesAPI.updateNote(id, updates);
      updateNoteInArrays(id, updatedNote);

      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(updatedNote);
      }

      return updatedNote;
    }, "Failed to update note");
  };

  const togglePin = async (id) => {
    return execute(async () => {
      const currentSelected = selectedNote?._id === id ? selectedNote : null;
      const currentArray =
        (allNotes && allNotes.find((n) => n._id === id)) ||
        (notes && notes.find((n) => n._id === id));
      const current = currentSelected || currentArray;

      const effectiveLocked =
        currentSelected != null ? !!currentSelected.locked : !!current?.locked;

      if (effectiveLocked) {
        setCreateError?.("Unlock the note before pinning.");
        setTimeout(() => setCreateError?.(null), 3000);
        return { blocked: true, note: current };
      }

      await notesAPI.togglePin(id);
      const fullNote = current ? { ...current, pinned: !current.pinned } : null;
      updateNoteInArrays(id, fullNote);
      return fullNote;
    }, "Failed to toggle pin");
  };

  return {
    updateNote,
    togglePin,
  };
};
