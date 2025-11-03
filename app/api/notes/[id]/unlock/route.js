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
    const { passkey } = await req.json();

    if (!passkey) {
      return NextResponse.json(
        { success: false, error: "Passkey is required" },
        { status: 400 }
      );
    }

    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    if (!note.locked) {
      return NextResponse.json(
        { success: false, error: "Note is not locked" },
        { status: 400 }
      );
    }

    if (note.passkey !== passkey) {
      return NextResponse.json(
        { success: false, error: "Incorrect passkey" },
        { status: 401 }
      );
    }

    note.locked = false;
    await note.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: note._id,
        locked: note.locked,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
