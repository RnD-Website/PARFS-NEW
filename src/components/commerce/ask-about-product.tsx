"use client";

import { useUI } from "@/stores/ui";
import { Icon } from "@/components/icons/icon";

export function AskAboutProduct({ name }: { name: string }) {
  const open = useUI((s) => s.openAssistant);
  const prompts = [`Is the ${name} worth it?`, `Compare the ${name} with similar products`, `What goes well with the ${name}?`];
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-violet/25 bg-white p-4">
      <p className="flex items-center gap-2 text-label">
        <Icon name="sparkles" size={16} className="text-violet" /> Ask GASENOS AI about this product
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button key={p} type="button" onClick={() => open(p)} className="rounded-full bg-violet-soft px-3.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#ddd6ff]">
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
