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

  useEffect(() => {
    if (selectedNote) {
      updateCounts(selectedNote.content || { reminders: [] });
    }
  }, [selectedNote, updateCounts]);

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
      <RemindersEditorContent
        selectedNote={props.selectedNote}
        onContentChange={props.onContentChange}
        updateCounts={props.updateCounts}
      />
    </BaseEditor>
  );
};

export default RemindersEditorWrapper;
