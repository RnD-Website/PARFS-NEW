"use client";

import { Button } from "@/components/ui/button";
import { useUI } from "@/stores/ui";

export function AskAIEmptyState({ prompt, label = "Ask GASENOS AI" }: { prompt: string; label?: string }) {
  const open = useUI((s) => s.openAssistant);
  return (
    <Button variant="ai" onClick={() => open(prompt)}>
      {label}
    </Button>
  );
}
