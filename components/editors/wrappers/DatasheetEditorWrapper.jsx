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

  useEffect(() => {
    if (selectedNote) {
      updateCounts(selectedNote.content || { columns: [], rows: [] });
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
      <DatasheetEditorContent
        selectedNote={props.selectedNote}
        onContentChange={props.onContentChange}
        updateCounts={props.updateCounts}
      />
    </BaseEditor>
  );
};

export default DatasheetEditorWrapper;
