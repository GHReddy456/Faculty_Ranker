/**
 * Sanitizes a faculty ID for use as a Firestore map key.
 *
 * Name-based IDs (e.g. "Dr. Anshul Gopal") contain spaces and dots which
 * cause Firestore to misinterpret them as nested paths.  We normalize them to
 * a safe slug (e.g. "Dr_Anshul_Gopal") while leaving real Firestore document
 * IDs (random alphanumeric strings) unchanged.
 */
export function sanitizeFacultyKey(id: string): string {
  // If it looks like a real Firestore auto-ID (no spaces, no dots at start,
  // 20 chars of base62), return as-is.
  if (/^[A-Za-z0-9]{15,25}$/.test(id)) return id;
  // Otherwise sanitize: strip leading/trailing whitespace, replace dots &
  // spaces with underscores, collapse consecutive underscores.
  return id.trim().replace(/[.\s]+/g, "_").replace(/_+/g, "_");
}
