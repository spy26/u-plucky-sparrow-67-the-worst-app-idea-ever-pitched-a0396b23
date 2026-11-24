// PunchLine: Holes to Confetti — make.fun entry.
// makefun anchor 44517a266c448b9193f4cc8b9c6f038a60b59a46 round 34248168
// The entry is exactly one sentence, 227 characters:
// "PunchLine is the app that punches holes in your paperwork for ten cents a hole, then sells you back the paper circles as premium confetti for twenty cents a bag, because waste is just confetti that hasn't found its purpose yet."
// Why this one: a hole-puncher that sells the holes back as premium
// confetti — the waste product is the product, priced twice, with a
// deadpan mission statement to close. One sentence, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "PunchLine is the app that punches holes in your paperwork for ten cents a hole, then sells you back the paper circles as premium confetti for twenty cents a bag, because waste is just confetti that hasn't found its purpose yet.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 240 characters,
// exactly one sentence. This entry is 227 characters, inside the gate.
// The length is counted in code points ([...LINE]), so any multi-byte
// character counts once, matching how the gate measures the file.
const chars = [...LINE];
if (chars.length < 1 || chars.length > 240 || LINE.trim().length === 0) {
  throw new Error("entry must be 1 to 240 characters of non-whitespace text");
}
if (LINE !== LINE.trim() || LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}
if (/[\u0000-\u001f\u007f]/.test(LINE)) {
  throw new Error("entry must not contain control characters");
}
// Printable-ASCII check: a one-sentence entry for this competition is
// conventionally ASCII, and a non-ASCII character that slips past the
// control-char guard above could confuse parsers, so reject anything
// outside 0x20-0x7E.
if (/[^\x20-\x7e]/.test(LINE)) {
  throw new Error("entry must contain only printable ASCII characters");
}
// One sentence: exactly one period, at the very end, and no other
// sentence terminators. (The entry has no decimals, so any '.' inside
// would be a second sentence.)
if (!LINE.endsWith(".") || LINE.slice(0, -1).includes(".") || LINE.includes("!") || LINE.includes("?")) {
  throw new Error("entry must be exactly one sentence");
}

// Write to MAKEFUN_OUTPUT_DIR when set, and to /output as well, so the gate
// finds the file either way. Dedupe first: when the harness already points
// at /output the two targets are one directory. No trailing newline: the
// file is the sentence, byte for byte.
const targets = [...new Set([process.env.MAKEFUN_OUTPUT_DIR, "/output"])].filter(
  (d): d is string => typeof d === "string" && d.length > 0,
);
for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  // Verify the write: read it back and require an exact match with LINE,
  // so a partial or corrupted write fails loudly instead of silently.
  if (readFileSync(outPath, "utf8") !== LINE) {
    throw new Error("entry.txt does not match the entry after writing");
  }
  // Byte-length check: the string comparison above can pass even if the
  // file's encoding differs (e.g. a BOM or a different normalization
  // form), so require the on-disk byte count to equal the UTF-8 byte
  // length of LINE exactly — no hidden prefix, no trailing newline.
  if (readFileSync(outPath).length !== Buffer.byteLength(LINE, "utf8")) {
    throw new Error("entry.txt byte length does not match the entry");
  }
}
