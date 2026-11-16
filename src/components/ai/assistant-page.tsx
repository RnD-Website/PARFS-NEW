"use client";

import { useAIChat } from "./use-ai-chat";
import { ChatView } from "./chat-view";
import { aiSection } from "@/content/home";
import { Icon, type IconName } from "@/components/icons/icon";

export function AssistantPage() {
  const chat = useAIChat();
  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_minmax(0,720px)] lg:gap-14 lg:py-12">
      <div className="flex flex-col gap-6 lg:pt-6">
        <p className="text-eyebrow text-violet">( {aiSection.eyebrow.toUpperCase()} )</p>
        <h1 className="text-h1">
          {aiSection.title[0]} {aiSection.title[1]}
        </h1>
        <p className="text-body-lg text-ink-2">{aiSection.subtext}</p>
        <ul className="hidden flex-col gap-5 lg:flex">
          {aiSection.features.map((f) => (
            <li key={f.title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
                <Icon name={f.icon as IconName} size={20} />
              </span>
              <span>
                <span className="block text-label">{f.title}</span>
                <span className="text-body-sm text-ink-muted">{f.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-[min(780px,calc(100dvh-var(--header-h)-48px))] min-h-[560px] overflow-hidden rounded-[28px] border border-line shadow-[0_24px_60px_rgba(28,26,23,0.08)]">
        <ChatView chat={chat} />
      </div>
    </div>
  );
}
