"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import {
  isContentEmpty,
  extractPlainText,
  hasNoteContent,
} from "@lib/utils/baseEditorUtils.js";
import {
  NOTE_TYPES,
  NOTE_FIELDS,
  TYPE_CHANGE_WARNING,
  DEFAULT_DATASHEET_COLUMNS,
} from "@lib/constants/noteConstants.js";

export const useBaseEditor = ({ selectedNote, onUpdateNote }) => {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [shouldBlinkDropdown, setShouldBlinkDropdown] = useState(false);
  const [typeChangeConfirmation, setTypeChangeConfirmation] = useState(null);
  const [shouldFocusTitle, setShouldFocusTitle] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [isUserEditing, setIsUserEditing] = useState(false);

  const titleInputRef = useRef(null);
  const noteType = selectedNote?.type || NOTE_TYPES.RICH_TEXT;

  const handleDebouncedUpdateCallback = useCallback(
    async (field, value) => {
      if (!selectedNote) return;

      const updates = { [field]: value };

      if (field === NOTE_FIELDS.CONTENT) {
        updates[NOTE_FIELDS.RAW_CONTENT] = extractPlainText(value);
      }

      setIsSaving(true);
      try {
        await onUpdateNote(selectedNote._id, updates);
      } finally {
        setIsSaving(false);
        setTimeout(() => setIsUserEditing(false), 100);
      }
    },
    [selectedNote, onUpdateNote]
  );

  const { debouncedCallback: debouncedUpdate, cleanup } = useDebounce(
    handleDebouncedUpdateCallback,
    1500
  );

  const updateCounts = useCallback((content) => {
    const plainText = extractPlainText(content);
    const words =
      plainText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length || 0;
    const chars = plainText.length;
    return { words, chars };
  }, []);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsUserEditing(true);
    setPendingUpdates((prev) => ({ ...prev, [NOTE_FIELDS.TITLE]: newTitle }));
    debouncedUpdate(NOTE_FIELDS.TITLE, newTitle);
  };

  const handleContentKeyDown = (e, content) => {
    if (e.key === "Enter") {
      debouncedUpdate.cancel?.();
      const updates = {
        [NOTE_FIELDS.CONTENT]: content,
        [NOTE_FIELDS.RAW_CONTENT]: extractPlainText(content),
      };
      setPendingUpdates({});
      handleUpdate(selectedNote._id, updates);
    }
  };

  const handleContentChange = useCallback(
    (newContent) => {
      // Calculate counts directly
      const plainText = extractPlainText(newContent);
      const words =
        plainText
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 0).length || 0;
      const chars = plainText.length;

      setWordCount(words);
      setCharCount(chars);

      setPendingUpdates((prev) => ({
        ...prev,
        [NOTE_FIELDS.CONTENT]: newContent,
      }));
      debouncedUpdate(NOTE_FIELDS.CONTENT, newContent);
    },
    [debouncedUpdate]
  );

  const handleUpdate = async (noteId, updates) => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      await onUpdateNote(noteId, updates);
    } finally {
      setIsSaving(false);
      setTimeout(() => setIsUserEditing(false), 100);
    }
  };

  const performTypeChange = async (newType) => {
    if (!selectedNote) return;

    let newContent = "";
    const now = Date.now().toString();

    switch (newType) {
      case NOTE_TYPES.CHECKLIST:
        newContent = { items: [{ id: now, text: "", checked: false }] };
        break;
      case NOTE_TYPES.DATASHEET:
        newContent = {
          columns: DEFAULT_DATASHEET_COLUMNS,
          rows: [
            {
              id: now,
              cells: DEFAULT_DATASHEET_COLUMNS.map((col) => ({
                columnId: col.id,
                value: "",
              })),
            },
          ],
        };
        break;
      case NOTE_TYPES.REMINDERS:
        newContent = {
          reminders: [
            {
              id: now,
              text: "",
              datetime: "",
              completed: false,
              priority: "medium",
            },
          ],
        };
        break;
      default:
        newContent = "";
    }

    await handleUpdate(selectedNote._id, {
      [NOTE_FIELDS.TYPE]: newType,
      [NOTE_FIELDS.CONTENT]: newContent,
      [NOTE_FIELDS.RAW_CONTENT]: extractPlainText(newContent),
    });

    setShouldBlinkDropdown(true);
    setTimeout(() => setShouldBlinkDropdown(false), 1000);
  };

  const handleTypeChange = async (newType) => {
    if (!selectedNote || selectedNote.type === newType) return;

    if (hasNoteContent(selectedNote.content)) {
      setTypeChangeConfirmation({
        newType,
        ...TYPE_CHANGE_WARNING,
      });
    } else {
      await performTypeChange(newType);
    }
  };

  const confirmTypeChange = async () => {
    if (typeChangeConfirmation) {
      await performTypeChange(typeChangeConfirmation.newType);
      setTypeChangeConfirmation(null);
    }
  };

  const cancelTypeChange = () => setTypeChangeConfirmation(null);

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.editorFocusHandler?.();
    }
  };

  useEffect(() => {
    if (shouldFocusTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
      setShouldFocusTitle(false);
    }
  }, [shouldFocusTitle]);

  useEffect(() => {
    if (selectedNote) {
      if (!isUserEditing) {
        setTitle(selectedNote.title || "");
      }

      if (
        selectedNote.title === "New Note" &&
        isContentEmpty(selectedNote.content)
      ) {
        setShouldFocusTitle(true);
      }
    }
  }, [selectedNote]);

  useEffect(() => cleanup, [cleanup]);

  return {
    title,
    isSaving,
    wordCount,
    charCount,
    noteType,
    titleInputRef,
    typeChangeConfirmation,
    shouldBlinkDropdown,
    handleTitleChange,
    handleContentChange,
    handleTypeChange,
    confirmTypeChange,
    cancelTypeChange,
    handleTitleKeyDown,
    updateCounts,
  };
};
