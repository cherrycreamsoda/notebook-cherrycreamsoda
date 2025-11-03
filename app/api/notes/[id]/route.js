import { NextResponse } from "next/server";
import dbConnect from "@lib/db";
import Note from "@lib/models/Note";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.isValidObjectId(id);

const extractPlainTextServer = (content) => {
  if (!content) return "";

  if (typeof content === "string") {
    return content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();
  }

  if (content?.items) {
    return content.items.map((i) => i.text || "").join(" ");
  }

  if (content?.rows) {
    return content.rows
      .map((row) => row.cells.map((cell) => cell.value || "").join(" "))
      .join(" ");
  }

  if (content?.reminders) {
    return content.reminders.map((r) => r.text || "").join(" ");
  }

  return "";
};

export async function GET(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!isValidId(id)) {
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
      const safe = {
        ...note.toObject(),
        content: "Note is Locked",
        rawContent: "",
      };
      return NextResponse.json({ success: true, data: safe });
    }

    return NextResponse.json({ success: true, data: note });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const allowed = ["title", "content", "rawContent", "type", "pinned"];
    const $set = {};
    for (const k of allowed) {
      if (k in body) $set[k] = body[k];
    }

    if ($set.content !== undefined && $set.rawContent === undefined) {
      $set.rawContent = extractPlainTextServer($set.content);
    }

    const note = await Note.findByIdAndUpdate(id, { $set }, { new: true });
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

export async function DELETE(req, context) {
  await dbConnect();
  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const current = await Note.findById(id);
    if (!current) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }
    if (current.locked) {
      return NextResponse.json(
        { success: false, error: "Cannot delete a locked note" },
        { status: 403 }
      );
    }
    if (current.pinned) {
      return NextResponse.json(
        { success: false, error: "Cannot delete a pinned note" },
        { status: 403 }
      );
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
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
