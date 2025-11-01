"use client";

import { notesAPI } from "@lib/services/api";

export const useNotesCreator = ({
  lastCreatedNote,
  setNotes,
  setAllNotes,
  setSelectedNote,
  setLastCreatedNote,
  setCreateError,
  execute,
}) => {
  const createNote = async (noteData = {}) => {
    return execute(async () => {
      if (lastCreatedNote) {
        const isLastNoteEmpty =
          lastCreatedNote.title === "" &&
          (!lastCreatedNote.content ||
            (typeof lastCreatedNote.content === "string" &&
              lastCreatedNote.content.trim() === "") ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.items &&
              lastCreatedNote.content.items.length === 1 &&
              !lastCreatedNote.content.items[0].text) ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.columns &&
              lastCreatedNote.content.rows &&
              lastCreatedNote.content.rows.length === 1 &&
              lastCreatedNote.content.rows[0].cells &&
              lastCreatedNote.content.rows[0].cells.every(
                (cell) => !cell.value
              )) ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.reminders &&
              lastCreatedNote.content.reminders.length === 1 &&
              !lastCreatedNote.content.reminders[0].text));

        if (isLastNoteEmpty) {
          setCreateError(
            "Note already created. Please add content to the existing note first."
          );
          setSelectedNote(lastCreatedNote);

          setTimeout(() => {
            setCreateError(null);
          }, 3000);

          return lastCreatedNote;
        }
      }

      let defaultContent = "";
      const noteType = noteData.type || "RICH_TEXT";

      switch (noteType) {
        case "CHECKLIST":
          defaultContent = {
            items: [{ id: Date.now().toString(), text: "", checked: false }],
          };
          break;
        case "REMINDERS":
          defaultContent = {
            reminders: [
              {
                id: Date.now().toString(),
                text: "",
                datetime: "",
                completed: false,
                priority: "medium",
              },
            ],
          };
          break;
        case "DATASHEET":
          defaultContent = {
            columns: [
              { id: "title", name: "Title", type: "text", width: "flex" },
              { id: "amount", name: "Amount", type: "number", width: "120px" },
              {
                id: "datetime",
                name: "Date & Time",
                type: "datetime",
                width: "200px",
              },
            ],
            rows: [
              {
                id: Date.now().toString(),
                cells: [
                  { columnId: "title", value: "" },
                  { columnId: "amount", value: "" },
                  { columnId: "datetime", value: "" },
                ],
              },
            ],
          };
          break;
        default:
          defaultContent = "";
      }

      const noteWithDefaults = {
        title: "",
        content: defaultContent,
        pinned: false,
        type: noteType,
        ...noteData,
      };

      const newNote = await notesAPI.createNote(noteWithDefaults);
      setNotes((prev) => [newNote, ...prev]);
      setAllNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      setLastCreatedNote(newNote);
      setCreateError(null);
      return newNote;
    }, "Failed to create note");
  };

  return {
    createNote,
  };
};
