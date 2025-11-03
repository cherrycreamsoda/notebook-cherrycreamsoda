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
      await notesAPI.setPasskey(id, passkey);
      const localNote =
        selectedNote?._id === id
          ? selectedNote
          : allNotes?.find((n) => n._id === id);
      const fullNote = localNote ? { ...localNote } : null;
      updateNoteInArrays(id, fullNote);
      if (selectedNote?._id === id) setSelectedNote(fullNote);
      return fullNote;
    }, "Failed to set passkey");
  };

  const lockNote = async (id) => {
    return execute(async () => {
      await notesAPI.lockNote(id);
      const localNote =
        selectedNote?._id === id
          ? selectedNote
          : allNotes?.find((n) => n._id === id);
      const fullNote = localNote ? { ...localNote, locked: true } : null;
      updateNoteInArrays(id, fullNote);
      if (selectedNote?._id === id) setSelectedNote(fullNote);
      return fullNote;
    }, "Failed to lock note");
  };

  const unlockNote = async (id, passkey) => {
    return execute(async () => {
      await notesAPI.unlockNote(id, passkey);
      const localNote =
        selectedNote?._id === id
          ? selectedNote
          : allNotes?.find((n) => n._id === id);

      // Update local note with unlocked flag
      let fullNote = localNote ? { ...localNote, locked: false } : null;

      // For unlocked notes, fetch full content to ensure editor works properly
      try {
        const freshNote = await notesAPI.fetchNoteById(id);
        if (freshNote && freshNote._id === id) {
          fullNote = freshNote;
        }
      } catch (e) {
        console.warn(
          "Failed to fetch full note after unlock, using merged data",
          e
        );
      }

      updateNoteInArrays(id, fullNote);
      if (selectedNote?._id === id) setSelectedNote(fullNote);
      return fullNote;
    }, "Failed to unlock note");
  };

  return { setPasskey, lockNote, unlockNote };
};
