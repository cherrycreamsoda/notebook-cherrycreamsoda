"use client";

import "../../styles/ConfirmationDialog.css";

const ConfirmationDialog = ({
  message,
  onConfirm,
  onCancel,
  position = { top: 0, left: 0 },
  confirmText = "Yes",
  cancelText = "No",
  type = "default",
  title = null,
}) => {
  const OctagonalIcon = () => (
    <svg
      width="440"
      height="440"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="octagonal-icon"
    >
      <path
        d="M8.464 2.5h7.072L21 8.464v7.072L15.536 21.5H8.464L3 15.536V8.464L8.464 2.5z"
        stroke="#8B0000"
        strokeWidth="2"
        fill="#8B0000"
      />
      <path
        d="M12 8v4M12 16h.01"
        stroke="#F5F5DC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="confirmation-backdrop">
      <div className="confirmation-dialog">
        <div className="confirmation-content">
          <div className="confirmation-header">
            <OctagonalIcon />
            {title && <span className="confirmation-title">{title}</span>}
          </div>
          <p className="confirmation-message">{message}</p>
          <div className="confirmation-actions">
            <button className="confirmation-btn confirm" onClick={onConfirm}>
              {confirmText}
            </button>
            <button className="confirmation-btn cancel" onClick={onCancel}>
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
