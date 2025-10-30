"use client";
import { useEffect, useCallback } from "react";

import BaseEditor from "../BaseEditor";
import ChecklistEditor from "../ChecklistEditor";

const ChecklistEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  useEffect(() => {
    window.editorFocusHandler = () => {
      const firstInput = document.querySelector(
        ".checklist-editor .item-input"
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
      updateCounts(selectedNote.content || { items: [] });
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
    <ChecklistEditor
      content={selectedNote?.content}
      onContentChange={handleContentChange}
    />
  );
};

const ChecklistEditorWrapper = (props) => {
  return (
    <BaseEditor
      {...props}
      showTitle={false}
      showToolbar={true}
      showStatusBar={true}
      editorClassName="checklist-mode"
    >
      <ChecklistEditorContent
        selectedNote={props.selectedNote}
        onContentChange={props.onContentChange}
        updateCounts={props.updateCounts}
      />
    </BaseEditor>
  );
};

export default ChecklistEditorWrapper;
