"use client";
import styles from "@styles/LockedEditorOverlay.module.css";
import {
  Lock,
  X,
  PanelLeftOpen,
  PanelLeftClose,
  Maximize,
  Minimize,
} from "lucide-react";

const LockedEditorOverlay = ({
  onClick,
  sidebarCollapsed,
  onToggleSidebar,
  isFullscreen,
  onToggleFullscreen,
  handleCloseNote,
}) => {
  return (
    <div className={styles.lockedOverlay} onClick={onClick}>
      <div className={styles.headerButtonsLayer}>
        <div className={styles.headerLeftActions}>
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSidebar();
            }}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullscreen();
            }}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
        <div className={styles.headerRightActions}>
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseNote();
            }}
            title="Close Note"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className={styles.overlayButtons}>
        <button className={styles.overlayBtn} title="Overlay button">
          <Lock size={16} />
        </button>
      </div>

      <div className={styles.lockedContent}>
        <div className={styles.hexagon}>
          <svg
            width="540"
            height="540"
            viewBox="0 0 24 24"
            fill="none"
            className="octagonal-icon"
          >
            <path
              d="M12 8v4M12 16h.01"
              stroke="#3d1719"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className={styles.unlockText}>Unlock to view and edit.</p>
      </div>
    </div>
  );
};

export default LockedEditorOverlay;
