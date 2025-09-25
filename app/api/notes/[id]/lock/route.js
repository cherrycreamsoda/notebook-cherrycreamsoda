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

    if (!passkey || passkey.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Invalid passkey. Must be 6 digits." },
        { status: 400 }
      );
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { locked: true, passkey: passkey },
      { new: true }
    );

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: note });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
