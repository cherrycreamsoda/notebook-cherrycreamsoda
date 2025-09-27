import { NextResponse } from "next/server";
import dbConnect from "@lib/db";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Health check DB connect error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
