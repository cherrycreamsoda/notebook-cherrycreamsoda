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
        { success: false, error: "Cannot pin/unpin a locked note" },
        { status: 403 }
      );
    }

    note.pinned = !note.pinned;
    await note.save();

    return NextResponse.json({ success: true, data: note });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
