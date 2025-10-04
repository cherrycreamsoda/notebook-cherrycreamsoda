"use client";
import React, { useEffect, useRef, useState } from "react";

import LoadingSpinner from "@components/common/LoadingSpinner";
import EditorContainer from "@components/editors/EditorContainer";
import PasscodeOverlay from "@components/PasscodeOverlay";
import { useAsyncAction } from "@hooks/useAsyncAction";

import "@styles/MainContent.css";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Pin,
  Trash2,
  Maximize,
  Minimize,
  X,
  Lock,
  Unlock,
} from "lucide-react";

const MainContent = ({
  selectedNote,
  setSelectedNote,
  onUpdateNote,
  sidebarCollapsed,
  onToggleSidebar,
  onTogglePin,
  onDeleteNote,
  isFullscreen,
  onToggleFullscreen,
  headerBackgroundEnabled,
  onSetPasskey,
  onLockNote,
  onUnlockNote,
}) => {
  const { loading: pinLoading, execute: executePin } = useAsyncAction();
  const { loading: deleteLoading, execute: executeDelete } = useAsyncAction();
  const { loading: lockLoading, execute: executeLock } = useAsyncAction();
  const headerRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPasscodeSetupOverlay, setShowPasscodeSetupOverlay] =
    useState(false);
  const [passcodeSetupMessage, setPasscodeSetupMessage] = useState("");
  const [passcodeSetupError, setPasscodeSetupError] = useState(false);
  const [passcodeOverlayMode, setPasscodeOverlayMode] = useState("setup");

  useEffect(() => {
    if (headerBackgroundEnabled !== undefined) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [headerBackgroundEnabled]);

  const handleTogglePin = () => {
    if (!selectedNote) return;
    executePin(() => onTogglePin(selectedNote._id), "Failed to toggle pin");
  };

  const handleCloseNote = () => {
    setSelectedNote(null);
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    executeDelete(
      () => onDeleteNote(selectedNote._id),
      "Failed to delete note"
    );
  };

  const handleToggleLock = async () => {
    if (!selectedNote) return;

    const isLocked = !!selectedNote.locked;
    const hasPasskey = selectedNote.passkey !== null;

    if (!hasPasskey) {
      // Need to set passkey first
      setPasscodeOverlayMode("setup");
      setShowPasscodeSetupOverlay(true);
      setPasscodeSetupMessage("");
      setPasscodeSetupError(false);
      return;
    }

    if (!isLocked) {
      // Lock immediately
      executeLock(async () => {
        const updated = await onLockNote(selectedNote._id);
        onUpdateNote(updated);
      }, "Failed to lock note");
    } else {
      // Unlock requires passcode
      setPasscodeOverlayMode("unlock");
      setShowPasscodeSetupOverlay(true);
      setPasscodeSetupMessage("");
      setPasscodeSetupError(false);
    }
  };

  const handlePasscodeSetup = async (enteredPasscode) => {
    setPasscodeSetupMessage("");
    setPasscodeSetupError(false);

    try {
      if (passcodeOverlayMode === "setup") {
        const updatedAfterSet = await onSetPasskey(
          selectedNote._id,
          enteredPasscode
        );
        // Optionally lock right after setting passkey to preserve current UX
        const updated = await onLockNote(updatedAfterSet._id);
        setPasscodeSetupMessage("Your password is set");
        setPasscodeSetupError(false);
        setTimeout(() => {
          setShowPasscodeSetupOverlay(false);
          onUpdateNote(updated);
        }, 1500);
      } else {
        // unlock flow
        const updated = await onUnlockNote(selectedNote._id, enteredPasscode);
        setPasscodeSetupMessage("Note unlocked!");
        setPasscodeSetupError(false);
        setTimeout(() => {
          setShowPasscodeSetupOverlay(false);
          onUpdateNote(updated);
        }, 1000);
      }
    } catch (error) {
      setPasscodeSetupMessage("Try Again");
      setPasscodeSetupError(true);
    }
  };

  const handleDismissPasscodeSetupOverlay = () => {
    setShowPasscodeSetupOverlay(false);
    setPasscodeSetupMessage("");
    setPasscodeSetupError(false);
  };

  const getHeaderClasses = () => {
    let classes = "main-header";

    if (headerBackgroundEnabled) {
      classes += " gradient-enabled";
    } else {
      classes += " gradient-disabled";
    }

    if (isTransitioning) {
      classes += " transitioning";
    }

    return classes;
  };

  if (!selectedNote) {
    return (
      <div
        className={`main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        } ${isFullscreen ? "fullscreen" : ""}`.trim()}
      >
        <MainHeader
          ref={headerRef}
          className={getHeaderClasses()}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
        <div className="main-content-inner">
          <div className="empty-main">
            <h1 className="welcome-title">Welcome to your Notebook</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${
        isFullscreen ? "fullscreen" : ""
      }`.trim()}
    >
      <MainHeader
        ref={headerRef}
        handleCloseNote={handleCloseNote}
        className={getHeaderClasses()}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        selectedNote={selectedNote}
        onTogglePin={handleTogglePin}
        onDelete={handleDelete}
        pinLoading={pinLoading}
        deleteLoading={deleteLoading}
        onToggleLock={handleToggleLock}
        lockLoading={lockLoading}
      />

      <div className="main-content-inner">
        <EditorContainer
          key={`${selectedNote._id}:${selectedNote.locked ? "L" : "U"}:${
            selectedNote.updatedAt || ""
          }`}
          selectedNote={selectedNote}
          onUpdateNote={onUpdateNote}
        />
      </div>

      {showPasscodeSetupOverlay && (
        <PasscodeOverlay
          onPasscodeEntered={handlePasscodeSetup}
          onDismiss={handleDismissPasscodeSetupOverlay}
          message={passcodeSetupMessage}
          isError={passcodeSetupError}
        />
      )}
    </div>
  );
};

const MainHeader = React.forwardRef(
  (
    {
      className,
      sidebarCollapsed,
      onToggleSidebar,
      isFullscreen,
      onToggleFullscreen,
      handleCloseNote,
      selectedNote,
      onTogglePin,
      onDelete,
      pinLoading,
      deleteLoading,
      onToggleLock,
      lockLoading,
    },
    ref
  ) => (
    <div className={className} ref={ref}>
      <div className="header-left-actions">
        <button
          className={`note-header-btn ${sidebarCollapsed ? "" : "active"}`}
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
        <button
          className={`note-header-btn ${isFullscreen ? "active" : ""}`}
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

      {selectedNote && (
        <div className="note-header-actions">
          {selectedNote.passkey === null ? (
            <button
              className="note-header-btn lock-btn"
              onClick={onToggleLock}
              title="Lock note"
              disabled={lockLoading}
            >
              {lockLoading ? (
                <LoadingSpinner size={14} inline={true} showMessage={false} />
              ) : (
                <Lock size={14} />
              )}
            </button>
          ) : (
            <button
              className={`note-header-btn lock-btn ${
                selectedNote.locked ? "active" : ""
              }`}
              onClick={onToggleLock}
              title={selectedNote.locked ? "Unlock note" : "Lock note"}
              disabled={lockLoading}
            >
              {lockLoading ? (
                <LoadingSpinner size={14} inline={true} showMessage={false} />
              ) : selectedNote.locked ? (
                <Lock size={14} />
              ) : (
                <Unlock size={14} />
              )}
            </button>
          )}

          <button
            className={`note-header-btn pin-btn ${
              selectedNote.pinned ? "active" : ""
            }`}
            onClick={onTogglePin}
            title={selectedNote.pinned ? "Unpin note" : "Pin note"}
            disabled={pinLoading || selectedNote.locked}
          >
            {pinLoading ? (
              <LoadingSpinner size={14} inline={true} showMessage={false} />
            ) : (
              <Pin size={14} />
            )}
          </button>

          <button
            className="note-header-btn delete-btn"
            onClick={onDelete}
            title="Delete note"
            disabled={deleteLoading || selectedNote.locked}
          >
            {deleteLoading ? (
              <LoadingSpinner size={14} inline={true} showMessage={false} />
            ) : (
              <Trash2 size={14} />
            )}
          </button>

          <button
            className="note-header-btn"
            onClick={handleCloseNote}
            title="Close Note"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
);

export default MainContent;
