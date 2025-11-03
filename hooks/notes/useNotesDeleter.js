"use client";

import { notesAPI } from "@lib/services/api";

export const useNotesDeleter = ({
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
}) => {
  const deleteNote = async (id) => {
    return execute(async () => {
      let noteToDelete =
        (selectedNote?._id === id ? selectedNote : null) ||
        allNotes.find((note) => note._id === id) ||
        notes.find((note) => note._id === id);

      if (!noteToDelete) {
        try {
          const serverNote = await notesAPI.fetchNoteById(id);
          if (serverNote && serverNote._id) {
            noteToDelete = serverNote;
            setAllNotes((prev) => {
              if (prev.find((n) => n._id === serverNote._id)) return prev;
              return [serverNote, ...prev];
            });
          }
        } catch (e) {}
      }

      const effectiveLocked =
        selectedNote?._id === id
          ? !!selectedNote.locked
          : !!noteToDelete?.locked;
      if (effectiveLocked) {
        setCreateError("Unlock the note before deleting.");
        setSelectedNote(noteToDelete);
        setTimeout(() => setCreateError(null), 3000);
        return { blocked: true, note: noteToDelete };
      }

      if (noteToDelete?.pinned) {
        setCreateError("Unpin the note before deleting.");
        setSelectedNote(noteToDelete);

        setTimeout(() => {
          setCreateError(null);
        }, 3000);

        return { blocked: true, note: noteToDelete };
      }

      const leanDeleted = await notesAPI.deleteNote(id);
      const fullNote = noteToDelete
        ? { ...noteToDelete, ...leanDeleted }
        : leanDeleted;

      if (fullNote && fullNote._id) {
        updateNoteInArrays(fullNote._id, fullNote);

        if (selectedNote?._id === fullNote._id) {
          setSelectedNote(fullNote);
        }
      }

      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(null);
      }

      return fullNote;
    }, "Failed to delete note");
  };

  const permanentDelete = async (id) => {
    return execute(async () => {
      const result = await notesAPI.permanentDelete(id);
      removeNoteFromArrays(id);

      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(null);
      }

      return result;
    }, "Failed to permanently delete note");
  };

  const restoreNote = async (id) => {
    return execute(async () => {
      const leanRestored = await notesAPI.restoreNote(id);
      const localNote = allNotes?.find((n) => n._id === id);
      const fullNote = localNote
        ? { ...localNote, ...leanRestored }
        : leanRestored;

      if (fullNote && fullNote._id) {
        updateNoteInArrays(fullNote._id, fullNote);
        if (selectedNote?._id === fullNote._id) {
          setSelectedNote(fullNote);
        }
      }

      return fullNote;
    }, "Failed to restore note");
  };

  const clearAllDeleted = async () => {
    return execute(async () => {
      const latestAllNotes = await notesAPI.getAllNotesIncludingDeleted();
      const deletedNotes = latestAllNotes.filter((note) => note.deleted);

      if (deletedNotes.length === 0) {
        return { success: true, deletedCount: 0, errors: [] };
      }

      const deleteResults = await Promise.allSettled(
        deletedNotes.map(async (note) => {
          try {
            await notesAPI.permanentDelete(note._id);
            return { success: true, noteId: note._id, title: note.title };
          } catch (error) {
            return {
              success: false,
              noteId: note._id,
              title: note.title,
              error: error.message,
            };
          }
        })
      );

      const successful = [];
      const failed = [];

      deleteResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            successful.push(result.value);
            removeNoteFromArrays(result.value.noteId);
          } else {
            failed.push(result.value);
          }
        } else {
          failed.push({ error: result.reason?.message || "Unknown error" });
        }
      });

      if (selectedNote?.deleted) {
        setSelectedNote(null);
      }

      if (lastCreatedNote?.deleted) {
        setLastCreatedNote(null);
      }

      if (failed.length > 0 && successful.length === 0) {
        throw new Error(
          `Failed to delete any notes. Errors: ${failed
            .map((f) => f.error)
            .join(", ")}`
        );
      } else if (failed.length > 0) {
        console.warn(`Some notes could not be deleted:`, failed);
      }

      return {
        success: true,
        deletedCount: successful.length,
        failedCount: failed.length,
        errors: failed,
      };
    }, "Failed to clear deleted notes");
  };

  return {
    deleteNote,
    permanentDelete,
    restoreNote,
    clearAllDeleted,
  };
};
