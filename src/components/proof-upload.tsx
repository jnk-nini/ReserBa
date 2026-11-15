"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { checkProofFile, uploadProof } from "@/lib/upload";

// Lets a resident upload (or replace) their proof of residency. The file goes
// to the private bucket, then its path is saved on the resident's own row.
export default function ProofUpload({ userId, hasProof }: { userId: string; hasProof: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const file = new FormData(formElement).get("proof");
    if (!(file instanceof File) || file.size === 0) {
      setMessage({ kind: "error", text: "Choose a file first." });
      return;
    }
    const problem = checkProofFile(file);
    if (problem) {
      setMessage({ kind: "error", text: problem });
      return;
    }

    setSending(true);
    setMessage(null);
    try {
      const path = await uploadProof("residency-proofs", userId, file);
      const { error } = await getSupabase()
        .from("users")
        .update({ proof_of_residency_url: path })
        .eq("user_id", userId);
      if (error) {
        setMessage({ kind: "error", text: "The file was uploaded but could not be saved. Please try again." });
      } else {
        setMessage({ kind: "ok", text: "Proof received. The HOA administrator will check it." });
        formElement.reset();
        router.refresh();
      }
    } catch (caught) {
      setMessage({ kind: "error", text: caught instanceof Error ? caught.message : "Upload failed." });
    }
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="label">
        {hasProof ? "Replace the proof" : "Proof of residency"}
        <input
          name="proof"
          type="file"
          required
          accept="image/jpeg,image/png,application/pdf"
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-tint file:px-3 file:py-1 file:font-semibold file:text-brand"
        />
        <span className="hint">
          A utility bill, title, or lease that shows your name and address. JPG, PNG, or PDF, up to 5 MB.
        </span>
      </label>
      {message && (
        <p role={message.kind === "error" ? "alert" : "status"} className={`notice notice-${message.kind}`}>
          {message.text}
        </p>
      )}
      <button type="submit" disabled={sending} className="btn btn-primary self-start">
        {sending ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
