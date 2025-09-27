"use client";
import React from "react";
import EditorToolbar from "../widgets/EditorToolbar";
import ConfirmationDialog from "@components/common/ConfirmationDialog";
import { useBaseEditor } from "@hooks/useBaseEditor.js";
import LockedEditorOverlay from "./LockedEditorOverlay";
import PasscodeOverlay from "@components/PasscodeOverlay";
import { useState } from "react";
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

  const handleUnlockAttempt = async (enteredPasscode) => {
    setPasscodeMessage("");
    setPasscodeError(false);

    try {
      const res = await fetch(`/api/notes/${selectedNote._id}/unlock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passkey: enteredPasscode }),
      });

      const data = await res.json();

      if (data.success) {
        setPasscodeMessage("Note unlocked!");
        setPasscodeError(false);
        setTimeout(() => {
          setShowPasscodeOverlay(false);
          onUpdateNote(data.data);
        }, 1000);
      } else {
        setPasscodeMessage("Try Again");
        setPasscodeError(true);
      }
    } catch (error) {
      console.error("Unlock API error:", error);
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
              {React.cloneElement(children, {
                selectedNote,
                onContentChange: handleContentChange,
                updateCounts,
                readOnly: selectedNote.locked,
              })}
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
