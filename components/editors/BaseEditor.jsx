"use client";
import React from "react";
import EditorToolbar from "../widgets/EditorToolbar";
import ConfirmationDialog from "@components/common/ConfirmationDialog";
import { useBaseEditor } from "@hooks/useBaseEditor.js";
import LockedEditorOverlay from "./LockedEditorOverlay";
import PasscodeOverlay from "@components/PasscodeOverlay";
import { useState } from "react";
import { useNotes } from "@hooks/useNotes";

const BaseEditor = ({
  selectedNote,
  onUpdateNote,
  children,
  showTitle = true,
  showToolbar = true,
  showStatusBar = true,
  editorClassName = "",
}) => {
  const {
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
  } = useBaseEditor({ selectedNote, onUpdateNote });

  const [showPasscodeOverlay, setShowPasscodeOverlay] = useState(false);
  const [passcodeMessage, setPasscodeMessage] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  const { unlockNote } = useNotes();

  const handleUnlockAttempt = async (enteredPasscode) => {
    setPasscodeMessage("");
    setPasscodeError(false);

    try {
      const updated = await unlockNote(selectedNote._id, enteredPasscode);
      if (updated && updated._id) {
        onUpdateNote(updated);
        setShowPasscodeOverlay(false);
        setPasscodeMessage("");
        setPasscodeError(false);
      } else {
        setPasscodeMessage("Try Again");
        setPasscodeError(true);
      }
    } catch (error) {
      setPasscodeMessage("Error unlocking note");
      setPasscodeError(true);
    }
  };

  const handleDismissPasscodeOverlay = () => {
    setShowPasscodeOverlay(false);
    setPasscodeMessage("");
    setPasscodeError(false);
  };

  return (
    <>
      {showToolbar && (
        <EditorToolbar
          noteType={noteType}
          selectedNote={selectedNote}
          onTypeChange={handleTypeChange}
          shouldBlinkDropdown={shouldBlinkDropdown}
        />
      )}

      <div className="editor-content-area">
        <div className={`note-editor ${editorClassName}`}>
          {selectedNote.locked && (
            <LockedEditorOverlay onClick={() => setShowPasscodeOverlay(true)} />
          )}

          {showTitle && (
            <div className="note-header">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                placeholder="Untitled"
                className="note-title-input"
                disabled={selectedNote.locked}
              />
              {isSaving && (
                <div className="saving-indicator">
                  <div className="saving-dot" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          )}
          <div
            className={`editor-container ${!showTitle ? "full-height" : ""}`}
          >
            <div className="content-wrapper">
              {!selectedNote.locked ? (
                React.cloneElement(children, {
                  selectedNote,
                  onContentChange: (data) => {
                    if (selectedNote.locked) return;
                    return handleContentChange(data);
                  },
                  updateCounts,
                  readOnly: selectedNote.locked,
                })
              ) : (
                <div className="editor-blank" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
      </div>

      {showStatusBar && (
        <div className="editor-status">
          <span className="word-count">{wordCount} words</span>
          <span className="char-count">{charCount} characters</span>
        </div>
      )}

      {typeChangeConfirmation && (
        <ConfirmationDialog
          title={typeChangeConfirmation.title}
          message={typeChangeConfirmation.message}
          onConfirm={confirmTypeChange}
          onCancel={cancelTypeChange}
          position={{
            top: window.innerHeight / 2 - 100,
            left: window.innerWidth / 2 - 200,
          }}
          confirmText="Change Type"
          cancelText="Cancel"
          type="warning"
        />
      )}

      {showPasscodeOverlay && (
        <PasscodeOverlay
          onPasscodeEntered={handleUnlockAttempt}
          onDismiss={handleDismissPasscodeOverlay}
          message={passcodeMessage}
          isError={passcodeError}
        />
      )}
    </>
  );
};

export default BaseEditor;
