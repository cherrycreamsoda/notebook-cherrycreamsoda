"use client";

import { notesAPI } from "@lib/services/api";

export const useNotesLoader = ({
  allNotes,
  selectedNote,
  setNotes,
  setAllNotes,
  setSelectedNote,
  execute,
  cache,
}) => {
  const loadNotes = async (view = "", search = "", options = {}) => {
    return execute(async () => {
      const needAllNotes =
        view === "all" ||
        allNotes.length === 0 ||
        options.forceAllRefresh === true;

      if (needAllNotes) {
        const [allNotesData, filteredNotes] = await Promise.all([
          notesAPI.getAllNotesIncludingDeleted(),
          notesAPI.getAllNotes(view, search),
        ]);

        setAllNotes(allNotesData);
        setNotes(filteredNotes);

        if (cache && allNotesData) {
          allNotesData.forEach((note) => {
            if (note && note._id) {
              cache.setCachedNote(note._id, note);
            }
          });
          console.log("Cached", allNotesData.length, "notes from loadNotes");
        }

        if (
          selectedNote &&
          !filteredNotes.find((note) => note._id === selectedNote._id)
        ) {
          setSelectedNote(null);
        }

        return { allNotesData, filteredNotes };
      } else {
        const filteredNotes = await notesAPI.getAllNotes(view, search);
        setNotes(filteredNotes);

        if (cache && filteredNotes) {
          filteredNotes.forEach((note) => {
            if (note && note._id) {
              cache.setCachedNote(note._id, note);
            }
          });
          console.log(
            "Cached",
            filteredNotes.length,
            "filtered notes from loadNotes"
          );
        }

        if (
          selectedNote &&
          !filteredNotes.find((note) => note._id === selectedNote._id)
        ) {
          setSelectedNote(null);
        }

        return { allNotesData: allNotes, filteredNotes };
      }
    }, "Failed to load notes");
  };

  const fetchNoteById = async (noteId) => {
    return execute(async () => {
      console.log("fetchNoteById called for:", noteId);

      if (cache) {
        const cachedNote = cache.getCachedNote(noteId);
        if (cachedNote) {
          console.log("Returning cached note from fetchNoteById");
          return cachedNote;
        }
      }

      const existingNote = allNotes.find((note) => note._id === noteId);
      if (existingNote) {
        console.log("Found note in allNotes array, caching it");
        if (cache) {
          cache.setCachedNote(noteId, existingNote);
        }
        return existingNote;
      }

      try {
        console.log("Fetching note from server:", noteId);
        const serverNote = await notesAPI.fetchNoteById(noteId);
        if (serverNote && serverNote._id) {
          setAllNotes((prev) => [serverNote, ...prev]);

          if (cache) {
            cache.setCachedNote(serverNote._id, serverNote);
            console.log("Cached note fetched from server");
          }

          return serverNote;
        }
      } catch (e) {
        console.error("Error fetching note from server:", e);
      }

      return null;
    }, "Failed to fetch note");
  };

  return {
    loadNotes,
    fetchNoteById,
  };
};
