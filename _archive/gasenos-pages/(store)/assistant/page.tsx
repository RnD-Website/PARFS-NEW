import type { Metadata } from "next";
import { AssistantPage } from "@/components/ai/assistant-page";

export const metadata: Metadata = {
  title: "GASENOS AI shopping assistant",
  description: "Describe what you need in plain words — GASENOS AI finds, compares and recommends products from our catalogue.",
};

export default function Page() {
  return <AssistantPage />;
}
