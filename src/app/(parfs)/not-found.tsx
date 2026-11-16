import { ParfsButton } from "@/components/parfs/ui/parfs-button";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center bg-p-paper px-40 pt-120 pb-120 text-center text-p-text max-lg:px-[20px] max-lg:pt-[100px] max-lg:pb-[80px]">
      <p className="p-mono text-p-grey">[404]</p>
      <h1 className="mt-16 font-italiana fs-72 leading-[1] uppercase max-lg:text-[44px]">This page has drifted away</h1>
      <p className="mt-20 max-w-480 p-body fs-17 leading-[1.55] text-p-text/75 max-lg:text-[16px]">The link may be broken, or the page may no longer exist.</p>
      <div className="mt-36 flex flex-wrap justify-center gap-16 max-lg:mt-[28px]">
        <ParfsButton theme="dark" solid href="/">
          Back to home
        </ParfsButton>
        <ParfsButton theme="dark" href="/collection">
          The collection
        </ParfsButton>
      </div>
    </section>
  );
}
