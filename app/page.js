"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

import TopBar from "@components/layout/TopBar";
import Sidebar from "@components/layout/Sidebar";
import MainContent from "@components/layout/MainContent";
import fullscreenStyles from "../styles/Fullscreen.module.css";
import LoadingSpinner from "@components/common/LoadingSpinner";
import ErrorMessage from "@components/common/ErrorMessage";
import FloatingActionButton from "@components/widgets/FloatingActionButton";

import { useNotes } from "@hooks/useNotes";
import { checkBackendHealth } from "@lib/services/api";

function PageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("notes");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isTransitioningFullscreen, setIsTransitioningFullscreen] =
    useState(false);
  const [headerBackgroundEnabled, setHeaderBackgroundEnabled] = useState(false);
  const topBarFullscreenClass = isFullscreen
    ? fullscreenStyles.fullscreenTopBar
    : "";

  const {
    notes,
    selectedNote,
    setSelectedNote,
    counts,
    error,
    createError,
    clearError,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    permanentDelete,
    restoreNote,
    togglePin,
    clearAllDeleted,
    cache,
  } = useNotes();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkBackendHealth();
        setBackendConnected(isConnected);

        if (!isConnected) {
          createError(
            "Database connection failed. Please check your server connection and try again."
          );
        }
      } catch (error) {
        console.error("Backend health check failed:", error);
        createError("Unable to connect to the database. Server may be down.");
        setBackendConnected(false);
      } finally {
        setInitialLoading(false);
      }
    };
    checkConnection();
  }, [createError]);

  useEffect(() => {
    if (backendConnected) {
      loadNotes(currentView, searchTerm);
    }
  }, [currentView, searchTerm, backendConnected]);

  useEffect(() => {
    if (isFullscreen) {
      setSidebarCollapsed(true);
    }
  }, [isFullscreen]);

  const handleCreateNote = useCallback(
    async (noteData = {}) => {
      const result = await createNote(noteData);
      if (result && currentView !== "notes") {
        setCurrentView("notes");
      }
    },
    [createNote, currentView]
  );

  const handleDeleteNote = useCallback(
    async (id) => {
      await deleteNote(id);
      await loadNotes(currentView, searchTerm);
    },
    [deleteNote, loadNotes, currentView, searchTerm]
  );

  const handleRestoreNote = useCallback(
    async (id) => {
      await restoreNote(id);
      await loadNotes(currentView, searchTerm);
    },
    [restoreNote, loadNotes, currentView, searchTerm]
  );

  const handleTogglePin = useCallback(
    async (id) => {
      await togglePin(id);
      await loadNotes(currentView, searchTerm);
    },
    [togglePin, loadNotes, currentView, searchTerm]
  );

  const handleClearAllDeleted = useCallback(async () => {
    await clearAllDeleted();
    setCurrentView("notes");
    await loadNotes("notes", "", { forceAllRefresh: true });
  }, [clearAllDeleted, loadNotes]);

  const handleViewChange = (newView) => {
    setCurrentView(newView);
    setSearchTerm("");
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen && !sidebarCollapsed) {
      setIsTransitioningFullscreen(true);
      setSidebarCollapsed(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsFullscreen(true);
      setIsTransitioningFullscreen(false);
    } else {
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleHeaderBackground = () => {
    setHeaderBackgroundEnabled(!headerBackgroundEnabled);
  };

  const handleApplyOrUpdateNote = useCallback(
    async (arg1, arg2) => {
      // If a single argument that looks like a note object is passed, apply it locally
      if (arg2 === undefined && arg1 && typeof arg1 === "object" && arg1._id) {
        // Update the currently selected note immediately
        setSelectedNote(arg1);
        // Refresh notes so lists reflect lock state changes
        await loadNotes(currentView, searchTerm);
        return arg1;
      }
      // Otherwise, assume normal (id, updates) signature and forward to updateNote
      return updateNote(arg1, arg2);
    },
    [setSelectedNote, loadNotes, currentView, searchTerm, updateNote]
  );

  if (initialLoading) {
    return (
      <div className={styles.app}>
        <div className={styles["app-loading"]}>
          <LoadingSpinner liquidAnimation={true} />
        </div>
      </div>
    );
  }

  if (!backendConnected && !initialLoading) {
    return (
      <div className={styles.app}>
        <div className={styles["app-loading"]}>
          <ErrorMessage
            message={error || createError || "Database connection failed"}
            onDismiss={clearError}
            onRetry={() => {
              setInitialLoading(true);
              const checkConnection = async () => {
                try {
                  const isConnected = await checkBackendHealth();
                  setBackendConnected(isConnected);
                  if (!isConnected) {
                    createError(
                      "Database connection failed. Please check your server connection and try again."
                    );
                  }
                } catch (error) {
                  createError(
                    "Unable to connect to the database. Server may be down."
                  );
                  setBackendConnected(false);
                } finally {
                  setInitialLoading(false);
                }
              };
              checkConnection();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.app} ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {/* <CacheDebugPanel cache={cache} /> */}

      <TopBar
        headerBackgroundEnabled={headerBackgroundEnabled}
        onToggleHeaderBackground={handleToggleHeaderBackground}
        fullscreenClass={topBarFullscreenClass}
      />

      {(error || createError) && (
        <ErrorMessage
          message={error || createError}
          onDismiss={clearError}
          onRetry={() => loadNotes(currentView, searchTerm)}
        />
      )}

      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={setSelectedNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onPermanentDelete={permanentDelete}
        onRestoreNote={handleRestoreNote}
        onTogglePin={handleTogglePin}
        onClearAllDeleted={handleClearAllDeleted}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentView={currentView}
        onViewChange={handleViewChange}
        counts={counts}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isFullscreen={isFullscreen}
        expandedFullscreenClass={
          isFullscreen ? fullscreenStyles.fullscreenSidebarExpanded : ""
        }
        collapsedFullscreenClass={
          isFullscreen ? fullscreenStyles.fullscreenSidebarCollapsed : ""
        }
      />

      <MainContent
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}
        onUpdateNote={handleApplyOrUpdateNote}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleSidebarToggle}
        onTogglePin={handleTogglePin}
        onDeleteNote={handleDeleteNote}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isTransitioningFullscreen={isTransitioningFullscreen}
        headerBackgroundEnabled={headerBackgroundEnabled}
      />

      <FloatingActionButton
        onCreateNote={handleCreateNote}
        selectedNote={selectedNote}
        sidebarCollapsed={sidebarCollapsed}
      />
    </div>
  );
}

export default function Page() {
  return <PageContent />;
}
