"use client"

import { notesAPI } from "@lib/services/api"

export const useNotesLoader = ({ allNotes, selectedNote, setNotes, setAllNotes, setSelectedNote, execute }) => {
  const loadNotes = async (view = "", search = "", options = {}) => {
    return execute(async () => {
      const needAllNotes = view === "all" || allNotes.length === 0 || options.forceAllRefresh === true

      if (needAllNotes) {
        const [allNotesData, filteredNotes] = await Promise.all([
          notesAPI.getAllNotesIncludingDeleted(),
          notesAPI.getAllNotes(view, search),
        ])

        setAllNotes(allNotesData)
        setNotes(filteredNotes)

        if (selectedNote && !filteredNotes.find((note) => note._id === selectedNote._id)) {
          setSelectedNote(null)
        }

        return { allNotesData, filteredNotes }
      } else {
        const filteredNotes = await notesAPI.getAllNotes(view, search)
        setNotes(filteredNotes)

        if (selectedNote && !filteredNotes.find((note) => note._id === selectedNote._id)) {
          setSelectedNote(null)
        }

        return { allNotesData: allNotes, filteredNotes }
      }
    }, "Failed to load notes")
  }

  const fetchNoteById = async (noteId) => {
    return execute(async () => {
      const existingNote = allNotes.find((note) => note._id === noteId) || allNotes.find((note) => note._id === noteId) // Updated to use allNotes instead of notes

      if (existingNote) {
        return existingNote
      }

      try {
        const serverNote = await notesAPI.fetchNoteById(noteId)
        if (serverNote && serverNote._id) {
          setAllNotes((prev) => [serverNote, ...prev])
          return serverNote
        }
      } catch (e) {}

      return null
    }, "Failed to fetch note")
  }

  return {
    loadNotes,
    fetchNoteById,
  }
}
