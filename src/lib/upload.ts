import { getSupabase } from "./supabase";

// Uploading proof files (proof of residency, proof of payment) from the browser
// straight into the private storage buckets. The storage rules only accept a
// file inside a folder named with the uploader's own user id.

export type ProofBucket = "residency-proofs" | "payment-proofs";

const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
const maxBytes = 5 * 1024 * 1024;

// Returns a sentence when the file cannot be accepted, or null when it is fine.
export function checkProofFile(file: File) {
  if (!allowedTypes.includes(file.type)) {
    return "The file must be a JPG or PNG photo, or a PDF.";
  }
  if (file.size > maxBytes) {
    return "The file is larger than 5 MB. Please use a smaller photo.";
  }
  return null;
}

// Saves the file and returns its path inside the bucket. The path, not a link,
// is what gets stored in the database.
export async function uploadProof(bucket: ProofBucket, userId: string, file: File) {
  const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  // The time in the name makes every upload a new file, so nothing is overwritten.
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await getSupabase().storage.from(bucket).upload(path, file, {
    contentType: file.type,
  });
  if (error) {
    throw new Error("The file could not be uploaded. Check your internet and try again.");
  }
  return path;
}
