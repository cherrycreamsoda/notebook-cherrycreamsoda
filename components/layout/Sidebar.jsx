"use client";
import { useRef, useState, useCallback, useEffect } from "react";

import SearchBar from "@components/widgets/SearchBar";
import NavigationMenu from "@components/widgets/NavigationMenu";
import NoteList from "@components/widgets/NoteList";
import ConfirmationDialog from "@components/common/ConfirmationDialog";

import { useAsyncAction } from "@hooks/useAsyncAction";

import "@styles/Sidebar.css";
import { Plus, Github, PanelLeftClose } from "lucide-react";

const Sidebar = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onPermanentDelete,
  onRestoreNote,
  onTogglePin,
  onClearAllDeleted,
  searchTerm,
  onSearchChange,
  currentView,
  onViewChange,
  counts,
  collapsed,
  onToggleCollapse,
  isFullscreen,
}) => {
  const sidebarRef = useRef(null);
  const { loading: createLoading, execute } = useAsyncAction();
  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState(null);

  const [showExpanded, setShowExpanded] = useState(!collapsed);
  const [isCollapsing, setIsCollapsing] = useState(false);

  useEffect(() => {
    // When collapsing: keep expanded DOM, play collapse animation, then unmount
    if (collapsed) {
      if (showExpanded) {
        setIsCollapsing(true);
        const t = setTimeout(() => {
          setIsCollapsing(false);
          setShowExpanded(false);
        }, 350); // keep in sync with CSS animation duration (400ms + buffer)
        return () => clearTimeout(t);
      }
    } else {
      // When expanding: mount the expanded DOM immediately; items already have slide-in animations
      setShowExpanded(true);
    }
  }, [collapsed, showExpanded]);

  const handleCreateNote = useCallback(async () => {
    try {
      await execute(async () => {
        await onCreateNote({
          type: "TEXT",
          title: "New Note",
          content: "",
        });
      }, "Failed to create note");
    } catch (error) {
      console.error("Create note error:", error);
    }
  }, [onCreateNote, execute]);

  const handleDeleteAllClick = () => {
    if (currentView === "deleted" && counts.deleted > 0) {
      setDeleteAllConfirmation({
        message: `Permanently delete all ${counts.deleted} deleted notes? This action cannot be undone.`,
        title: "Delete All Notes?",
        type: "danger",
      });
    } else {
      onViewChange("deleted");
    }
  };

  const confirmDeleteAll = async () => {
    try {
      await execute(onClearAllDeleted, "Failed to clear deleted notes");
      setDeleteAllConfirmation(null);
    } catch (error) {
      setDeleteAllConfirmation(null);
    }
  };

  const cancelDeleteAll = () => {
    setDeleteAllConfirmation(null);
  };

  const handleGithubClick = () => {
    window.open("https://github.com/cherrycreamsoda", "_blank");
  };

  if (!showExpanded && collapsed) {
    return (
      <div
        className={`sidebar sidebar-collapsed ${
          typeof window !== "undefined" &&
          window.innerWidth <= 768 &&
          isFullscreen
            ? "fullscreen-hidden"
            : ""
        }`.trim()}
      >
        <div className="sidebar-toggle-collapsed">
          <button
            className="github-btn"
            onClick={handleGithubClick}
            title="Visit GitHub Profile"
          >
            <Github size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`sidebar sidebar-expanded ${
          isCollapsing ? "collapsing" : ""
        } ${
          typeof window !== "undefined" &&
          window.innerWidth <= 768 &&
          isFullscreen
            ? "fullscreen-overlay"
            : ""
        }`.trim()}
        ref={sidebarRef}
        tabIndex={0}
        onAnimationEnd={(e) => {
          // Only handle the root collapse animation end, not child animations
          if (!isCollapsing) return;
          if (!(e.target instanceof HTMLElement)) return;
          // Match our root collapsing class
          if (
            e.currentTarget === e.target &&
            e.animationName &&
            e.animationName.includes("sidebarCollapseOut")
          ) {
            setIsCollapsing(false);
            setShowExpanded(false);
          }
        }}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand"></div>
          <div className="sidebar-header-actions">
            <button
              className="header-action-btn"
              onClick={() => handleCreateNote()}
              title="Create new note"
              disabled={createLoading}
            >
              <Plus size={16} />
            </button>

            {typeof window !== "undefined" && window.innerWidth <= 768 && (
              <button
                className="header-action-btn sidebar-close-btn"
                onClick={onToggleCollapse}
                title="Close Sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-content">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onClear={() => onSearchChange("")}
          />

          <NavigationMenu
            currentView={currentView}
            onViewChange={onViewChange}
            counts={counts}
            onDeleteAll={handleDeleteAllClick}
            isDeleteMode={currentView === "deleted" && counts.deleted > 0}
          />

          <NoteList
            notes={notes}
            selectedNote={selectedNote}
            onSelectNote={onSelectNote}
            currentView={currentView}
            onViewChange={onViewChange}
            onDeleteNote={onDeleteNote}
            onPermanentDelete={onPermanentDelete}
            onRestoreNote={onRestoreNote}
            onTogglePin={onTogglePin}
            onCreateNote={handleCreateNote}
            searchTerm={searchTerm}
            onSearchClear={() => onSearchChange("")}
          />
        </div>
      </div>

      {deleteAllConfirmation && (
        <ConfirmationDialog
          title={deleteAllConfirmation.title}
          message={deleteAllConfirmation.message}
          onConfirm={confirmDeleteAll}
          onCancel={cancelDeleteAll}
          position={{
            top: window.innerHeight / 2 - 100,
            left: window.innerWidth / 2 - 200,
          }}
          confirmText="Delete All"
          cancelText="Cancel"
          type={deleteAllConfirmation.type}
        />
      )}
    </>
  );
};

export default Sidebar;
