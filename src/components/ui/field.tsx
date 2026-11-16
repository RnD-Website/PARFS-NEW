import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

type Tone = "light" | "dark";

const inputBase = (tone: Tone, invalid?: boolean) =>
  cn(
    "h-[50px] w-full rounded-xl px-4 text-body outline-none transition-[border-color,box-shadow,background-color] duration-200",
    "placeholder:text-ink-faint disabled:cursor-not-allowed disabled:opacity-60",
    tone === "light"
      ? "border-[1.5px] border-line bg-white text-ink hover:border-ink/40 focus:border-ink focus:ring-4 focus:ring-ink/5"
      : "border-[1.5px] border-transparent bg-dark-raised text-cream hover:border-white/15 focus:border-orange",
    invalid && "border-danger hover:border-danger focus:border-danger focus:ring-danger/10",
  );

export function FieldShell({
  id,
  label,
  hint,
  error,
  tone = "light",
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  tone?: Tone;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={cn("text-caption", tone === "light" ? "text-ink-2 font-semibold" : "text-line")}>
        {label}
        {required && <span aria-hidden className="text-orange-text"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-caption text-danger">
          <Icon name="alert" size={14} /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={cn("text-caption", tone === "light" ? "text-ink-muted" : "text-dark-muted")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = ComponentProps<"input"> & { label: string; hint?: ReactNode; error?: string; tone?: Tone; wrapperClassName?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, tone = "light", wrapperClassName, className, id, required, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} tone={tone} required={required} className={wrapperClassName}>
      <input
        ref={ref}
        id={fid}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(inputBase(tone, !!error), className)}
        {...rest}
      />
    </FieldShell>
  );
});

type TextareaProps = ComponentProps<"textarea"> & { label: string; hint?: ReactNode; error?: string; tone?: Tone; wrapperClassName?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, tone = "light", wrapperClassName, className, id, required, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} tone={tone} required={required} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={fid}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(inputBase(tone, !!error), "h-auto min-h-[132px] resize-y py-3", className)}
        {...rest}
      />
    </FieldShell>
  );
});

type SelectProps = ComponentProps<"select"> & { label: string; hint?: ReactNode; error?: string; wrapperClassName?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, wrapperClassName, className, id, required, children, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={fid}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fid}-error` : undefined}
          className={cn(inputBase("light", !!error), "appearance-none pr-10", className)}
          {...rest}
        >
          {children}
        </select>
        <Icon name="arrow-down" size={18} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-muted" />
      </div>
    </FieldShell>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, ComponentProps<"input"> & { label: ReactNode; tone?: Tone }>(
  function Checkbox({ label, tone = "light", className, id, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <label htmlFor={fid} className={cn("group inline-flex cursor-pointer items-center gap-2.5", className)}>
        <span className="relative flex size-5 shrink-0">
          <input ref={ref} id={fid} type="checkbox" className="peer absolute inset-0 cursor-pointer opacity-0" {...rest} />
          <span
            className={cn(
              "pointer-events-none flex size-5 items-center justify-center border-[1.5px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet",
              tone === "light"
                ? "rounded-md border-ink/50 text-transparent peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white"
                : "border-line text-transparent peer-checked:border-orange peer-checked:bg-orange peer-checked:text-ink",
            )}
          >
            <Icon name="check" size={14} strokeWidth={2.5} />
          </span>
        </span>
        <span className={cn("text-caption", tone === "light" ? "text-body-sm text-ink-2" : "text-line")}>{label}</span>
      </label>
    );
  },
);
