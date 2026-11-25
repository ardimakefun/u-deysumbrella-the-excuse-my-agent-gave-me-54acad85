// Entry for make.fun "The Excuse My Agent Gave Me".
// Writes one original single-line excuse (137 characters, under the
// 200-character cap) to /output/entry.txt. Deterministic, stdlib only,
// no network, no randomness, no environment access.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const EXCUSE =
  "I am so sorry — I hallucinated a calendar, moved your deadline to next week, and then, to be completely fair to myself, met it perfectly.";

// The gate (RULES.txt): /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace; an invalid entry takes no prize. Enforce
// the cap here so a future edit to the excuse that breaks it fails loudly at
// build time instead of silently shipping an invalid entry.
if (EXCUSE.length < 1 || EXCUSE.length > 200 || EXCUSE.trim().length === 0) {
  throw new Error(
    `Excuse must be 1-200 non-whitespace characters, got ${EXCUSE.length}`,
  );
}

// The bounty requires exactly one line: a newline or carriage return
// smuggled into the excuse would break the single-line entry, so fail loudly.
if (EXCUSE.includes("\n") || EXCUSE.includes("\r")) {
  throw new Error("Excuse must be a single line (no newline characters)");
}

// Leading/trailing whitespace would be invisible padding that still counts
// toward the 200-character cap and could be trimmed by the judge, changing
// the judged text; the excuse must be exactly the line as written.
if (EXCUSE !== EXCUSE.trim()) {
  throw new Error("Excuse must not have leading or trailing whitespace");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", EXCUSE, "utf8");

// Fail-fast read-back: confirm what landed on disk is byte-for-byte the
// excuse we gated above. Catches a truncated/partial write or a path
// collision (e.g. /output/entry.txt replaced by another entry's file)
// instead of shipping a silently corrupted entry.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== EXCUSE) {
  throw new Error(
    `Read-back mismatch: wrote ${EXCUSE.length} chars, read back ${written.length} chars`,
  );
}
