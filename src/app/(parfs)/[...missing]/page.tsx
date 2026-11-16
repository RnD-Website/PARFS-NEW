import { notFound } from "next/navigation";

/** Any address the PARFS site doesn't have renders the PARFS 404 (inside the PARFS header/footer). */
export default function Missing() {
  notFound();
}
