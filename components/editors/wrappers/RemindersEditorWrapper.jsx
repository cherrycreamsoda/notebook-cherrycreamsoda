"use client";
import { useEffect, useCallback } from "react";

import BaseEditor from "../BaseEditor";
import RemindersEditor from "../RemindersEditor";

const RemindersEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  useEffect(() => {
    window.editorFocusHandler = () => {
      const firstInput = document.querySelector(
        ".reminders-editor .reminder-input"
      );
      if (firstInput) {
        firstInput.focus();
      }
    };
    return () => {
      window.editorFocusHandler = null;
    };
  }, []);

  // Only depend on selectedNote to initialize counts once
  useEffect(() => {
    if (selectedNote) {
      updateCounts(selectedNote.content || { reminders: [] });
    }
  }, [selectedNote]); // Depend on the entire object to ensure all changes are captured

  const handleContentChange = useCallback(
    (newContent) => {
      // Don't call updateCounts here - let BaseEditor handle it via handleContentChange
      onContentChange(newContent);
    },
    [onContentChange]
  );

  return (
    <RemindersEditor
      content={selectedNote?.content}
      onContentChange={handleContentChange}
    />
  );
};

const RemindersEditorWrapper = (props) => {
  return (
    <BaseEditor
      {...props}
      showTitle={false}
      showToolbar={true}
      showStatusBar={true}
      editorClassName="reminders-mode"
    >
      <RemindersEditorContent />
    </BaseEditor>
  );
};

export default RemindersEditorWrapper;
