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
    if (!passkey || typeof passkey !== "string" || passkey.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Invalid passkey. Must be 6 digits." },
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

    if (note.passkey !== null) {
      return NextResponse.json(
        { success: false, error: "Passkey already set; cannot be changed" },
        { status: 403 }
      );
    }

    note.passkey = passkey;
    await note.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const note = await Note.findById(id).select("passkey").lean();
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    const hasPasskey = note.passkey !== null;
    return NextResponse.json({ success: true, data: { hasPasskey } });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
