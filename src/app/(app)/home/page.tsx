import { redirect } from "next/navigation";
import { homePathFor, requireUser } from "@/lib/auth";

// Sends each person to the first screen of their role.
export default async function HomePage() {
  const user = await requireUser();
  redirect(homePathFor(user.role));
}
