import { Fragment, type ElementType } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** One string per visual line. */
  lines: string | readonly string[];
  as?: ElementType;
  by?: "char" | "word";
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** Play on page load (above the fold) instead of when scrolled into view. */
  now?: boolean;
};

/**
 * Server-rendered text split into masked chars or words for the PARFS reveal
 * (animated by <SmoothScroll>). Screen readers get the plain sentence.
 */
export function SplitText({ lines, as: Tag = "p", by = "char", className, lineClassName, delay, stagger, now }: Props) {
  const list = typeof lines === "string" ? [lines] : lines;
  const label = list.join(" ");

  return (
    <Tag
      className={className}
      aria-label={label}
      data-reveal="split"
      data-reveal-delay={delay}
      data-reveal-stagger={stagger ?? (by === "word" ? 0.06 : 0.035)}
      data-reveal-now={now ? "" : undefined}
    >
      {list.map((line, li) => (
        <span key={li} aria-hidden className={cn("block", lineClassName)}>
          {line.split(" ").map((word, wi, words) => (
            <Fragment key={wi}>
              {by === "word" ? (
                <span className="p-split-mask">
                  <span className="p-split-item">{word}</span>
                </span>
              ) : (
                <span className="p-split-mask">
                  {Array.from(word).map((ch, ci) => (
                    <span key={ci} className="p-split-item">
                      {ch}
                    </span>
                  ))}
                </span>
              )}
              {wi < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  );
}
