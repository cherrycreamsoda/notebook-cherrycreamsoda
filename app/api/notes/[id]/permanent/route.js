import { NextResponse } from "next/server";
import dbConnect from "@lib/db";
import Note from "@lib/models/Note";
import mongoose from "mongoose";

export async function DELETE(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }
    if (note.locked) {
      return NextResponse.json(
        { success: false, error: "Cannot permanently delete a locked note" },
        { status: 403 }
      );
    }
    if (note.pinned) {
      return NextResponse.json(
        { success: false, error: "Cannot permanently delete a pinned note" },
        { status: 403 }
      );
    }
    if (!note.deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot permanently delete a note that is not deleted",
        },
        { status: 400 }
      );
    }

    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
