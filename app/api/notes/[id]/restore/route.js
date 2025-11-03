import { NextResponse } from "next/server";
import dbConnect from "@lib/db";
import Note from "@lib/models/Note";
import mongoose from "mongoose";

export async function PUT(req, context) {
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
        { success: false, error: "Cannot restore a locked note" },
        { status: 403 }
      );
    }

    if (!note.deleted) {
      return NextResponse.json(
        { success: false, error: "Cannot restore a note that is not deleted" },
        { status: 400 }
      );
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { deleted: false },
      { new: true }
    );
    if (!updatedNote) {
      return NextResponse.json(
        { success: false, error: "Note not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
