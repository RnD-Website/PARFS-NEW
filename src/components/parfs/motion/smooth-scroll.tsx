"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
/** True while the current navigation came from the browser's back/forward buttons. */
let historyNav = false;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    historyNav = true;
  });
}

/** Pause / resume smooth scrolling (e.g. while a drawer is open). */
export function setScrollLocked(locked: boolean) {
  if (locked) lenisInstance?.stop();
  else lenisInstance?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Smoothly scroll to a target (selector, element or y-offset). Falls back to native scrolling. */
export function scrollToTarget(target: string | number | HTMLElement) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * The PARFS motion runtime:
 *  • Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
 *  • Declarative reveals for server-rendered markup:
 *      data-reveal="split"  → masked chars/words rise in (see <SplitText>)
 *      data-reveal="fade"   → fade + lift
 *      data-reveal-delay    → seconds
 *      data-reveal-now      → play on load instead of on scroll (above the fold)
 *      data-speed="0.2"     → scroll parallax (fraction of own height)
 * Respects prefers-reduced-motion (no smoothing, no transforms).
 */
/** Sets up the declarative reveals / parallax for every element not handled yet (safe to call per page). */
function setupReveals() {
  const fresh = <T extends HTMLElement>(sel: string) =>
    gsap.utils.toArray<T>(sel).filter((el) => {
      if (el.dataset.pMotion) return false;
      el.dataset.pMotion = "1";
      return true;
    });

  // Split text reveals
  fresh('[data-reveal="split"]').forEach((el) => {
    const items = el.querySelectorAll<HTMLElement>(".p-split-item");
    const delay = Number(el.dataset.revealDelay ?? 0);
    const stagger = Number(el.dataset.revealStagger ?? 0.035);
    const now = el.hasAttribute("data-reveal-now");
    gsap.fromTo(
      items,
      // `y: 0` clears the pre-paint CSS offset, which GSAP would otherwise read in as pixels.
      { y: 0, yPercent: 110 },
      { y: 0, yPercent: 0, duration: 1.25, ease: "expo.out", stagger, delay, scrollTrigger: now ? undefined : { trigger: el, start: "top 88%", once: true } },
    );
  });

  // Fades
  fresh('[data-reveal="fade"]').forEach((el) => {
    const delay = Number(el.dataset.revealDelay ?? 0);
    const now = el.hasAttribute("data-reveal-now");
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: Number(el.dataset.revealY ?? 24) },
      { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", delay, scrollTrigger: now ? undefined : { trigger: el, start: "top 92%", once: true } },
    );
  });

  // Hero-style parallax: content drifts down as its section scrolls away (no gaps at the top).
  fresh("[data-drift]").forEach((el) => {
    const amount = Number(el.dataset.drift);
    const trigger = (el.closest("section") as HTMLElement | null) ?? el;
    gsap.to(el, {
      y: () => trigger.offsetHeight * amount,
      ease: "none",
      scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
  });

  // Parallax
  fresh("[data-speed]").forEach((el) => {
    const speed = Number(el.dataset.speed);
    const trigger = (el.closest("[data-parallax-root]") as HTMLElement | null) ?? el;
    gsap.fromTo(el, { yPercent: -speed * 50 }, { yPercent: speed * 50, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true } });
  });
}

export function SmoothScroll() {
  const pathname = usePathname();

  // Smooth scrolling — created once for the lifetime of the PARFS layout.
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("p-ready");
    if (reduce) {
      root.classList.remove("p-js");
      return;
    }
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: 0 } });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Fonts/images can shift layout after first paint.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // Reveals — re-scanned on every page, because the layout (and this component) persists across navigation.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Drop triggers whose elements left with the previous page.
    ScrollTrigger.getAll().forEach((st) => {
      const t = st.trigger as Element | undefined;
      if (t && !document.contains(t)) st.kill();
    });
    // New page (not back/forward, no #anchor): start at the top. Lenis keeps its own scroll target, so
    // reset it too — otherwise it glides back to where the previous page was scrolled.
    const toTop = !historyNav && !window.location.hash;
    const resetTop = () => {
      lenisInstance?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    };
    // Repeated over the next frames: Next.js applies its own scroll handling after commit and can race us.
    const topTimers: ReturnType<typeof setTimeout>[] = [];
    if (toTop) {
      resetTop();
      [0, 60, 180].forEach((ms) => topTimers.push(setTimeout(resetTop, ms)));
    }
    historyNav = false;
    lenisInstance?.resize();
    let hashTimer: ReturnType<typeof setTimeout> | undefined;
    const raf = requestAnimationFrame(() => {
      setupReveals();
      ScrollTrigger.refresh();
      // Arriving via "/#section" from another page: scroll there once pins/spacers exist.
      const hash = window.location.hash;
      if (hash.length > 1) {
        hashTimer = setTimeout(() => {
          const target = document.querySelector(hash);
          if (target) scrollToTarget(target as HTMLElement);
        }, 120);
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hashTimer);
      topTimers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
