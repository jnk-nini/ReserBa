import type { ProofBucket } from "./upload";

// The address that opens an uploaded proof (see src/app/files/route.ts).
export function proofLink(bucket: ProofBucket, path: string) {
  return `/files?bucket=${bucket}&path=${encodeURIComponent(path)}`;
}
