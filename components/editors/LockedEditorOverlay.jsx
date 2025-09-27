"use client";
import styles from "@styles/LockedEditorOverlay.module.css";
import { Lock } from "lucide-react";

const LockedEditorOverlay = ({ onClick }) => {
  return (
    <div className={styles.lockedOverlay} onClick={onClick}>
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
