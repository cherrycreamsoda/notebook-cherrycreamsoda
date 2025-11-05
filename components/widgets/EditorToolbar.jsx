"use client";
import { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  Minus,
  FileText,
  Maximize2,
  ChevronUp,
} from "lucide-react";

import NoteTypeDropdown from "./NoteTypeDropdown";
import { DEFAULT_BUTTON_STATES } from "@lib/constants/richTextEditorConstants";

const EditorToolbar = ({
  noteType = "RICH_TEXT",
  selectedNote,
  onTypeChange,
  shouldBlinkDropdown = false,
  headerHidden = false,
  onToggleHeaderHide,
}) => {
  const [buttonStates, setButtonStates] = useState(DEFAULT_BUTTON_STATES);

  useEffect(() => {
    if (noteType === "RICH_TEXT") {
      const updateStates = () => {
        if (window.richTextFormatting) {
          setButtonStates(window.richTextFormatting.buttonStates);
        }
      };

      const interval = setInterval(updateStates, 100);
      return () => clearInterval(interval);
    }
  }, [noteType]);

  const getFormatting = () => window.richTextFormatting || {};

  const richTextActions = [
    {
      icon: Bold,
      action: () => getFormatting().smartFormat?.("bold"),
      title: "Bold (Ctrl+B)",
      isActive: () => buttonStates.bold,
      type: "smart",
    },
    {
      icon: Italic,
      action: () => getFormatting().smartFormat?.("italic"),
      title: "Italic (Ctrl+I)",
      isActive: () => buttonStates.italic,
      type: "smart",
    },
    {
      icon: Underline,
      action: () => getFormatting().smartFormat?.("underline"),
      title: "Underline (Ctrl+U)",
      isActive: () => buttonStates.underline,
      type: "smart",
    },
    {
      icon: Minus,
      action: () => getFormatting().smartFormat?.("strikeThrough"),
      title: "Strikethrough",
      isActive: () => buttonStates.strikeThrough,
      type: "smart",
    },
    {
      icon: List,
      action: () => getFormatting().toggleList?.("insertUnorderedList"),
      title: "Bullet List",
      isActive: () => buttonStates.insertUnorderedList,
      type: "list",
    },
    {
      icon: ListOrdered,
      action: () => getFormatting().toggleList?.("insertOrderedList"),
      title: "Numbered List",
      isActive: () => buttonStates.insertOrderedList,
      type: "list",
    },
    {
      icon: Type,
      action: () => getFormatting().toggleHeading?.(),
      title: "Heading",
      isActive: () => buttonStates.heading,
      type: "toggle",
    },
  ];

  const renderEditorSpecificTools = () => {
    switch (noteType) {
      case "RICH_TEXT":
        return (
          <>
            {richTextActions.map((action, index) => (
              <button
                key={index}
                className={`format-btn ${action.isActive() ? "active" : ""} ${
                  action.type
                }`}
                onClick={action.action}
                title={action.title}
                disabled={!selectedNote}
              >
                <action.icon size={14} />
              </button>
            ))}
          </>
        );

      case "TEXT":
        return (
          <div className="editor-mode-indicator">
            <Type size={14} />
            <span>Plain Text Mode</span>
          </div>
        );

      case "CHECKLIST":
        return (
          <div className="editor-mode-indicator">
            <span>Checklist Mode</span>
          </div>
        );

      case "REMINDERS":
        return (
          <div className="editor-mode-indicator">
            <span>Reminders Mode</span>
          </div>
        );

      case "DATASHEET":
        return (
          <div className="editor-mode-indicator">
            <span>Datasheet Mode</span>
          </div>
        );

      default:
        return (
          <div className="editor-mode-indicator">
            <FileText size={14} />
            <span>Editor Mode</span>
          </div>
        );
    }
  };

  const isTypeChangeDisabled =
    !selectedNote || selectedNote.locked || selectedNote.pinned;

  return (
    <div className="formatting-toolbar">
      <NoteTypeDropdown
        selectedType={noteType}
        onTypeChange={onTypeChange}
        disabled={isTypeChangeDisabled}
        shouldBlink={shouldBlinkDropdown}
      />
      <div className="toolbar-separator" />
      {renderEditorSpecificTools()}
      <div className="toolbar-separator" />
      <button
        className={`format-btn header-hide-btn ${headerHidden ? "active" : ""}`}
        onClick={onToggleHeaderHide}
        title={headerHidden ? "Show header" : "Hide header & fullscreen"}
        disabled={!selectedNote}
      >
        {headerHidden ? <ChevronUp size={14} /> : <Maximize2 size={14} />}
      </button>
    </div>
  );
};

export default EditorToolbar;
