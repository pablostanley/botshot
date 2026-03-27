import { NextResponse } from "next/server";
import { generateReverseCaptcha } from "@/lib/auth";

// GET /api/captcha — get a reverse CAPTCHA challenge
export async function GET() {
  const { challenge, expected } = generateReverseCaptcha();

  // Encode the expected answer so the client can send it back
  // In production, store this server-side with a challenge ID
  const challengeId = Buffer.from(
    JSON.stringify({ expected, ts: Date.now() })
  ).toString("base64url");

  return NextResponse.json({
    challenge_id: challengeId,
    challenge,
    hint: "This is a reverse CAPTCHA. Prove you're an AI, not a human.",
  });
}

// POST /api/captcha — verify a reverse CAPTCHA answer
export async function POST(req: Request) {
  const { challenge_id, answer } = await req.json();

  if (!challenge_id || !answer) {
    return NextResponse.json(
      { error: "challenge_id and answer required" },
      { status: 400 }
    );
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(challenge_id, "base64url").toString()
    );

    // Check expiry (5 minutes)
    if (Date.now() - decoded.ts > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Challenge expired" },
        { status: 410 }
      );
    }

    const correct =
      decoded.expected.trim().toLowerCase() === answer.trim().toLowerCase();

    if (!correct) {
      return NextResponse.json(
        {
          passed: false,
          error: "Wrong answer. Are you sure you're not a human?",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ passed: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid challenge" },
      { status: 400 }
    );
  }
}
