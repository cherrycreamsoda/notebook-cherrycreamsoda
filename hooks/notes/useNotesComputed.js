"use client";

import { useMemo } from "react";

export const useNotesComputed = ({ allNotes }) => {
  const counts = useMemo(() => {
    return {
      active: allNotes.filter((note) => !note.deleted).length,
      pinned: allNotes.filter((note) => note.pinned && !note.deleted).length,
      deleted: allNotes.filter((note) => note.deleted).length,
    };
  }, [allNotes]);

  return {
    counts,
  };
};
