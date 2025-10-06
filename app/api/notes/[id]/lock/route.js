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

    if (note.passkey === null) {
      return NextResponse.json(
        { success: false, error: "Passkey not set for this note" },
        { status: 400 }
      );
    }

    if (note.locked) {
      const safe = {
        ...note.toObject(),
        content: "Note is Locked",
        rawContent: "",
      };
      return NextResponse.json({ success: true, data: safe });
    }

    note.locked = true;
    await note.save();

    const safe = {
      ...note.toObject(),
      content: "Note is Locked",
      rawContent: "",
    };
    return NextResponse.json({ success: true, data: safe });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
