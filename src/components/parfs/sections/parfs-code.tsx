import { parfsCode } from "@/content/parfs-home";
import { SplitText } from "../motion/split-text";
import { CodeArch, CodeSeal } from "./code-arch";

const IMG = "/images/parfs";

/** Figma: The Parfs Code (1440×960) — art-deco frame, arch with six markers, script headline. */
export function ParfsCode() {
  const { title, headline, body, step, markers } = parfsCode;

  return (
    <section
      id="maison"
      aria-labelledby="parfs-code-title"
      className="relative overflow-hidden bg-gradient-to-b from-p-sand-2 to-p-paper text-p-text max-lg:px-[20px] max-lg:pt-[96px] max-lg:pb-[72px] lg:h-960"
    >
      {/* Frame ornaments */}
      <div aria-hidden className="pointer-events-none absolute inset-0 max-lg:hidden" data-reveal="fade" data-reveal-y="0">
        <span className="absolute top-100 bottom-0 left-56 w-px bg-p-gold/30" />
        <span className="absolute top-100 bottom-0 left-64 w-px bg-p-gold/30" />
        <span className="absolute top-100 bottom-0 left-1376 w-px bg-p-gold/30" />
        <span className="absolute top-100 bottom-0 left-1384 w-px bg-p-gold/30" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/code-corner-left.svg`} alt="" width={64} height={64} className="absolute top-[calc(var(--spacing)*38.2)] left-[calc(var(--spacing)*54.4)] size-64" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/code-corner-right.svg`} alt="" width={64} height={64} className="absolute top-[calc(var(--spacing)*38.2)] left-[calc(var(--spacing)*1322.6)] size-64 -scale-x-100" />
      </div>

      <SplitText
        as="h2"
        lines={title}
        className="relative text-center font-italiana fs-32 leading-none tracking-[0.22em] text-p-text uppercase max-lg:text-[24px] lg:absolute lg:top-130 lg:left-1/2 lg:-translate-x-1/2 lg:whitespace-nowrap"
        stagger={0.03}
      />

      {/* Arch + markers (animated). Desktop: absolute in the 1440 frame. Mobile: a scaled copy of the same frame. */}
      <CodeArch markers={markers} />

      <SplitText
        as="p"
        lines={headline}
        className="relative text-center font-italiana fs-80 text-p-gold max-lg:text-[48px] lg:absolute lg:top-440 lg:left-[calc(var(--spacing)*720.5)] lg:-translate-x-1/2 lg:whitespace-nowrap"
        lineClassName="leading-[0.95]"
        delay={0.1}
      />

      <div className="relative mt-[24px] text-center p-body fs-18 leading-[1.55] text-p-grey max-lg:text-[16px] lg:absolute lg:top-616 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2 lg:whitespace-nowrap" data-reveal="fade" data-reveal-delay="0.3">
        {body.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>

      <CodeSeal className="relative mx-auto mt-[36px] flex size-64 items-center justify-center rounded-full border border-p-gold/60 max-lg:size-[56px] lg:absolute lg:top-708 lg:left-688 lg:mt-0" />

      <p className="relative mt-[48px] text-center p-mono whitespace-pre text-p-grey lg:absolute lg:top-880 lg:left-604 lg:mt-0 lg:text-left" data-reveal="fade" data-reveal-delay="0.2">
        {step}
      </p>
    </section>
  );
}
