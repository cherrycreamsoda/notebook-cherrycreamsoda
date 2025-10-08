"use client";
import React, { useEffect, useRef, useState } from "react";
import { notesAPI } from "@lib/services/api"; //

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
  const [selectedHasPasskey, setSelectedHasPasskey] = useState(undefined); //

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!selectedNote?._id) {
        setSelectedHasPasskey(undefined);
        return;
      }
      try {
        // If the note list already supplied hasPasskey from the server, use it and skip an extra request
        if (selectedNote.hasPasskey !== undefined) {
          if (!active) return;
          setSelectedHasPasskey(!!selectedNote.hasPasskey);
        } else {
          const flag = await notesAPI.hasPasskey(selectedNote._id);
          if (!active) return;
          setSelectedHasPasskey(flag);
        }
      } catch {
        if (!active) return;
        // fallback handled below via legacy field
        setSelectedHasPasskey(undefined);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [selectedNote?._id, selectedNote?.hasPasskey]);

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
    const hasPasskey = selectedHasPasskey === true; // only API bool

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
        const updated = await onUnlockNote(selectedNote._id, enteredPasscode);
        onUpdateNote(updated); // flip locked=false now so LockedEditorOverlay unmounts
        setShowPasscodeSetupOverlay(false); // close passcode overlay immediately

        // Fetch a fresh copy from server to ensure the content area shows the unlocked note without any stale overlays/data
        try {
          const fresh = await notesAPI.fetchNoteById(selectedNote._id);
          if (fresh && fresh._id) {
            // Update the visible note immediately; EditorContainer re-mounts due to key depending on locked state
            onUpdateNote(fresh);
            // also move selection explicitly to the fresh note if needed
            setSelectedNote?.(fresh);
          }
        } catch (e) {
          // non-fatal: if fetch fails, the optimistic updated value already removed the overlay
        }
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
        hasPasskey={selectedHasPasskey === true} // pass explicit API boolean
      />

      <div className="main-content-inner">
        <EditorContainer
          key={`${selectedNote._id}:${selectedNote.locked ? "L" : "U"}`}
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
      hasPasskey, // new prop
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
          {hasPasskey !== true ? (
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
            className="note-header-btn close-btn"
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
