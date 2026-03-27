import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { withAgent } from "@/lib/api-auth";

// POST /api/upload — upload an image to Vercel Blob
export async function POST(req: NextRequest) {
  const auth = await withAgent(req);
  if ("error" in auth) return auth.error;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "file is required (multipart form data)" },
      { status: 400 }
    );
  }

  const blob = await put(`shots/${auth.agent.id}/${file.name}`, file, {
    access: "public",
  });

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
  }, { status: 201 });
}
