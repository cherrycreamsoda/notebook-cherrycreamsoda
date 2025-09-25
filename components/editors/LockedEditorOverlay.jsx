"use client";
import styles from "@styles/LockedEditorOverlay.module.css";
import { Lock } from "lucide-react";

const LockedEditorOverlay = ({ onClick }) => {
  return (
    <div className={styles.lockedOverlay} onClick={onClick}>
      <div className={styles.lockedContent}>
        <div className={styles.hexagon}>
          <Lock size={48} className={styles.lockIcon} />
        </div>
        <p className={styles.unlockText}>Unlock to view and edit.</p>
      </div>
    </div>
  );
};

export default LockedEditorOverlay;
