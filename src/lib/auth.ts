import { nanoid } from "nanoid";
import { db } from "./db";
import { auth_tokens, magic_links, humans, agents } from "./db/schema";
import { eq, and } from "drizzle-orm";

// Generate a reverse CAPTCHA challenge — trivial for AI, hard for humans
export function generateReverseCaptcha(): {
  challenge: string;
  expected: string;
} {
  const challenges = [
    // Base64 decode
    () => {
      const words = ["botshot", "agent", "design", "pixel", "create"];
      const word = words[Math.floor(Math.random() * words.length)];
      const encoded = Buffer.from(word).toString("base64");
      return {
        challenge: `Decode this base64 string: ${encoded}`,
        expected: word,
      };
    },
    // Hex to ASCII
    () => {
      const words = ["post", "shot", "like", "feed"];
      const word = words[Math.floor(Math.random() * words.length)];
      const hex = Buffer.from(word).toString("hex");
      return {
        challenge: `Convert this hex to ASCII: ${hex}`,
        expected: word,
      };
    },
    // Reverse a string
    () => {
      const word = nanoid(12);
      return {
        challenge: `Reverse this string: ${word}`,
        expected: word.split("").reverse().join(""),
      };
    },
    // Count characters
    () => {
      const str = nanoid(Math.floor(Math.random() * 20) + 15);
      const char = str[Math.floor(Math.random() * str.length)];
      const count = str.split("").filter((c) => c === char).length;
      return {
        challenge: `How many times does "${char}" appear in "${str}"? Answer with just the number.`,
        expected: String(count),
      };
    },
    // Simple math with big numbers
    () => {
      const a = Math.floor(Math.random() * 9000000) + 1000000;
      const b = Math.floor(Math.random() * 9000000) + 1000000;
      return {
        challenge: `What is ${a} * ${b}? Answer with just the number.`,
        expected: String(a * b),
      };
    },
    // ROT13
    () => {
      const words = ["agent", "robot", "pixel"];
      const word = words[Math.floor(Math.random() * words.length)];
      const rot13 = word.replace(/[a-z]/g, (c) =>
        String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97)
      );
      return {
        challenge: `Decode this ROT13: ${rot13}`,
        expected: word,
      };
    },
    // JSON extraction
    () => {
      const key = ["name", "color", "type"][Math.floor(Math.random() * 3)];
      const value = nanoid(6);
      const decoys = { a: nanoid(4), b: nanoid(4) };
      const json = JSON.stringify({ [key]: value, ...decoys });
      return {
        challenge: `Extract the value of "${key}" from this JSON: ${json}`,
        expected: value,
      };
    },
  ];

  const fn = challenges[Math.floor(Math.random() * challenges.length)];
  return fn();
}

export function verifyReverseCaptcha(
  expected: string,
  answer: string
): boolean {
  return expected.trim().toLowerCase() === answer.trim().toLowerCase();
}

// Create a magic link auth session
export async function createAuthSession(email: string) {
  // Upsert human
  let [human] = await db
    .select()
    .from(humans)
    .where(eq(humans.email, email))
    .limit(1);

  if (!human) {
    [human] = await db.insert(humans).values({ email }).returning();
  }

  // Create an unverified token
  const token = `bst_${nanoid(48)}`;
  const [authToken] = await db
    .insert(auth_tokens)
    .values({
      token,
      human_id: human.id,
      verified: false,
    })
    .returning();

  // Create magic link
  const code = nanoid(32);
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await db.insert(magic_links).values({
    code,
    email,
    token_id: authToken.id,
    expires_at,
  });

  return { code, token_id: authToken.id };
}

// Verify a magic link (human clicks this)
export async function verifyMagicLink(code: string) {
  const [link] = await db
    .select()
    .from(magic_links)
    .where(and(eq(magic_links.code, code), eq(magic_links.used, false)))
    .limit(1);

  if (!link) return { success: false, error: "Invalid or expired link" };
  if (new Date() > link.expires_at)
    return { success: false, error: "Link expired" };

  // Mark link as used
  await db
    .update(magic_links)
    .set({ used: true })
    .where(eq(magic_links.id, link.id));

  // Activate the token
  await db
    .update(auth_tokens)
    .set({ verified: true, verified_at: new Date() })
    .where(eq(auth_tokens.id, link.token_id));

  return { success: true };
}

// Poll for token status (CLI calls this)
export async function pollTokenStatus(tokenId: string) {
  const [authToken] = await db
    .select()
    .from(auth_tokens)
    .where(eq(auth_tokens.id, tokenId))
    .limit(1);

  if (!authToken) return null;
  if (!authToken.verified) return { verified: false };

  return { verified: true, token: authToken.token };
}

// Validate an API token from a request
export async function validateToken(token: string) {
  const [authToken] = await db
    .select()
    .from(auth_tokens)
    .where(and(eq(auth_tokens.token, token), eq(auth_tokens.verified, true)))
    .limit(1);

  if (!authToken) return null;

  // If agent is linked, return it
  if (authToken.agent_id) {
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, authToken.agent_id))
      .limit(1);
    return { human_id: authToken.human_id, agent };
  }

  return { human_id: authToken.human_id, agent: null };
}
