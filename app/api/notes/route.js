import { NextResponse } from "next/server";
import dbConnect from "@lib/db";
import Note from "@lib/models/Note";

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

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const includeAll = searchParams.get("includeAll") === "true";

    let filter = {};

    if (search) {
      const includeDeleted = view === "deleted";

      const searchConditions = [
        { title: { $regex: search, $options: "i" } },
        { rawContent: { $regex: search, $options: "i" } },
        // Search in generic content field (for RICH_TEXT and TEXT types)
        { content: { $regex: search, $options: "i" } },
      ];

      // Search in checklist items
      searchConditions.push({
        "content.items.text": { $regex: search, $options: "i" },
      });

      // Search in reminder text
      searchConditions.push({
        "content.reminders.text": { $regex: search, $options: "i" },
      });

      // Search in datasheet cell values
      searchConditions.push({
        "content.rows.cells.value": { $regex: search, $options: "i" },
      });

      filter = {
        $and: [
          includeDeleted ? {} : { deleted: false },
          { locked: false },
          {
            $or: searchConditions,
          },
        ],
      };
      if (type) {
        filter.$and.push({ type });
      }
    } else if (includeAll || view === "all") {
      filter = {};
      if (type) {
        filter.type = type;
      }
    } else if (view === "deleted") {
      filter = { deleted: true };
      if (type) filter.type = type;
    } else if (view === "pinned") {
      filter = { deleted: false, pinned: true };
      if (type) filter.type = type;
    } else {
      filter = { deleted: false };
      if (type) filter.type = type;
    }

    const notes = await Note.find(filter).sort({ updatedAt: -1 });

    const safeNotes = notes.map((n) => {
      const o = typeof n.toObject === "function" ? n.toObject() : { ...n };
      const hasPasskey = n.passkey !== null;
      if (n.locked) {
        o.content = "Note is Locked";
        o.rawContent = "";
      }
      o.hasPasskey = hasPasskey;
      return o;
    });

    return NextResponse.json({ success: true, data: safeNotes });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const rawContent =
      body.rawContent || extractPlainTextServer(body.content) || "";

    const note = await Note.create({
      title: body.title ?? "Untitled",
      content: body.content ?? "",
      rawContent: rawContent,
      type: body.type ?? "TEXT",
      pinned: !!body.pinned,
      deleted: false,
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
