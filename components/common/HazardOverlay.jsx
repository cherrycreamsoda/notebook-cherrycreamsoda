"use client";
import styles from "@styles/LockedEditorOverlay.module.css";

const HazardOverlay = () => {
  return (
    // Use same overlay styling, but ensure it sits below the fixed error popup.
    <div
      className={styles.lockedOverlay}
      style={{ zIndex: 900, cursor: "default" }}
    >
      <div className={styles.lockedContent}>
        <div className={styles.hexagon}>
          <svg
            width="540"
            height="540"
            viewBox="0 0 24 24"
            fill="none"
            className="octagonal-icon"
            aria-hidden="true"
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
        {/* No unlock text here by design */}
      </div>
    </div>
  );
};

export default HazardOverlay;
