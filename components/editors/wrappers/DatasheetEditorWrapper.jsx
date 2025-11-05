"use client";
import { useEffect, useCallback } from "react";

import BaseEditor from "../BaseEditor";
import DatasheetEditor from "../DatasheetEditor";

const DatasheetEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  useEffect(() => {
    window.editorFocusHandler = () => {};
    return () => {
      window.editorFocusHandler = null;
    };
  }, []);

  // Only depend on selectedNote ID to initialize counts once
  useEffect(() => {
    if (selectedNote) {
      updateCounts(selectedNote.content || { columns: [], rows: [] });
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
    <DatasheetEditor
      content={selectedNote?.content}
      onContentChange={handleContentChange}
    />
  );
};

const DatasheetEditorWrapper = (props) => {
  return (
    <BaseEditor
      {...props}
      showTitle={false}
      showToolbar={true}
      showStatusBar={true}
      editorClassName="datasheet-mode"
    >
      <DatasheetEditorContent />
    </BaseEditor>
  );
};

export default DatasheetEditorWrapper;
