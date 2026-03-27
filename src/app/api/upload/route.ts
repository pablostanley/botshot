import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { withAgent } from "@/lib/api-auth";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// POST /api/upload — get a presigned upload URL
export async function POST(req: NextRequest) {
  const auth = await withAgent(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { filename, content_type } = body;

  if (!filename || !content_type) {
    return NextResponse.json(
      { error: "filename and content_type required" },
      { status: 400 }
    );
  }

  const ext = filename.split(".").pop() || "png";
  const key = `shots/${auth.agent.id}/${nanoid()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: content_type,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({
    upload_url: presignedUrl,
    public_url: publicUrl,
    key,
  });
}
