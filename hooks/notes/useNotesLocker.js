"use client";

import { notesAPI } from "@lib/services/api";

export const useNotesLocker = ({
  allNotes,
  selectedNote,
  setAllNotes,
  setSelectedNote,
  updateNoteInArrays,
  execute,
}) => {
  const setPasskey = async (id, passkey) => {
    return execute(async () => {
      const updated = await notesAPI.setPasskey(id, passkey);
      updateNoteInArrays(id, updated);
      if (selectedNote?._id === id) setSelectedNote(updated);
      return updated;
    }, "Failed to set passkey");
  };

  const lockNote = async (id) => {
    return execute(async () => {
      const updated = await notesAPI.lockNote(id);
      updateNoteInArrays(id, updated);
      if (selectedNote?._id === id) setSelectedNote(updated);
      return updated;
    }, "Failed to lock note");
  };

  const unlockNote = async (id, passkey) => {
    return execute(async () => {
      const updated = await notesAPI.unlockNote(id, passkey);
      updateNoteInArrays(id, updated);
      if (selectedNote?._id === id) setSelectedNote(updated);
      return updated;
    }, "Failed to unlock note");
  };

  return { setPasskey, lockNote, unlockNote };
};
