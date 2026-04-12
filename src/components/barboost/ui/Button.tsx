import { cn } from "@/lib/cn";
import { useEffect, useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "cursor-pointer bg-violet-600 text-white shadow-md shadow-black/20 hover:bg-violet-500 active:bg-violet-900 active:brightness-95 active:shadow-inner",
  secondary:
    "cursor-pointer bg-white/[0.07] text-white border border-white/[0.1] hover:bg-white/[0.1] active:bg-white/[0.14] active:brightness-95",
  ghost:
    "cursor-pointer text-white/75 hover:text-white hover:bg-white/[0.04] active:bg-white/[0.08]",
  danger:
    "cursor-pointer bg-red-600/95 text-white hover:bg-red-500 active:bg-red-700",
};

const baseChrome =
  "relative z-[60] inline-flex touch-manipulation select-none items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-tight transition-[transform,background-color,box-shadow,filter] duration-150 [-webkit-tap-highlight-color:rgba(167,139,250,0.35)]";

/** Zelfde oppervlak als `<Button>` — voor `<Link>` (betrouwbare navigatie op iOS). */
export function buttonClassName(
  variant: ButtonVariant = "primary",
  className?: string,
) {
  return cn(baseChrome, variants[variant], className);
}

export function Button({
  className,
  variant = "primary",
  children,
  onClick,
  onPointerUp,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  /**
   * iOS Safari + scrollbare ancestor: `click` wordt vaak niet afgeleverd na een tik.
   * Native `touchend` met `{ passive: false }` + `preventDefault` triggert `onClick` hier;
   * een eventuele late synthetische `click` wordt genegeerd via `skipSyntheticClick`.
   */
  const skipSyntheticClick = useRef(false);
  const skipResetTimer = useRef<number | null>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || disabled) return;

    const handleTouchEnd = (ev: TouchEvent) => {
      const target = ev.target as Node | null;
      if (!target || !el.contains(target)) return;
      if (!onClickRef.current) return;

      if (skipResetTimer.current) {
        window.clearTimeout(skipResetTimer.current);
        skipResetTimer.current = null;
      }

      skipSyntheticClick.current = true;
      try {
        ev.preventDefault();
      } catch {
        /* ignore */
      }
      onClickRef.current(
        ev as unknown as React.MouseEvent<HTMLButtonElement>,
      );

      skipResetTimer.current = window.setTimeout(() => {
        skipSyntheticClick.current = false;
        skipResetTimer.current = null;
      }, 400);
    };

    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      el.removeEventListener("touchend", handleTouchEnd);
      if (skipResetTimer.current) {
        window.clearTimeout(skipResetTimer.current);
      }
    };
  }, [disabled]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (skipSyntheticClick.current) {
      skipSyntheticClick.current = false;
      if (skipResetTimer.current) {
        window.clearTimeout(skipResetTimer.current);
        skipResetTimer.current = null;
      }
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      className={cn(
        baseChrome,
        "disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        className,
      )}
      {...rest}
      onPointerUp={onPointerUp}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
