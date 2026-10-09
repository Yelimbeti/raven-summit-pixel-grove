const KEY = "callit-voter";

export function getVoterKey(): string {
  const existing = localStorage.getItem(KEY);
  if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) return existing;
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const next = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  localStorage.setItem(KEY, next);
  return next;
}
