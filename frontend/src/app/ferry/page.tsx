// app/ferry/page.tsx
import { redirect } from "next/navigation";

export default function FerryIndex() {
  redirect("/ferry/overview");
}
