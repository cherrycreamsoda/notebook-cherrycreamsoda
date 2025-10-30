export const formatDate = (date) => {
  const noteDate = new Date(date);
  const day = String(noteDate.getDate()).padStart(2, "0");
  const month = String(noteDate.getMonth() + 1).padStart(2, "0");
  const year = noteDate.getFullYear();

  let hours = noteDate.getHours();
  const minutes = String(noteDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
};

export const getPreview = (content, maxLength = 50) => {
  let previewText = "";

  // Handle different content types
  if (typeof content === "string") {
    previewText = content;
  } else if (content?.items) {
    // Checklist
    previewText = content.items
      .slice(0, 2)
      .map((item) => item.text || "Untitled item")
      .join(", ");
    if (content.items.length > 2) {
      previewText += ` and ${content.items.length - 2} more...`;
    }
  } else if (content?.reminders) {
    // Reminders
    previewText = content.reminders
      .slice(0, 2)
      .map((r) => r.text || "Untitled reminder")
      .join(", ");
    if (content.reminders.length > 2) {
      previewText += ` and ${content.reminders.length - 2} more...`;
    }
  } else if (content?.rows) {
    // Datasheet
    previewText = `${content.rows.length} rows of data`;
  }

  return previewText.length > maxLength
    ? previewText.substring(0, maxLength) + "..."
    : previewText;
};
