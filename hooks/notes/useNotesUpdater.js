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
      const current =
        (allNotes && allNotes.find((n) => n._id === id)) ||
        (notes && notes.find((n) => n._id === id));

      if (current?.locked) {
        setCreateError?.("Unlock the note before pinning.");
        setTimeout(() => setCreateError?.(null), 3000);
        return { blocked: true, note: current };
      }

      const updatedNote = await notesAPI.togglePin(id);
      updateNoteInArrays(id, updatedNote);
      return updatedNote;
    }, "Failed to toggle pin");
  };

  return {
    updateNote,
    togglePin,
  };
};
