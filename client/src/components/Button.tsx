import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'danger';

const styles: Record<Variant, string> = {
  primary:
    'bg-ink text-paper-light active:scale-[0.98] disabled:bg-ink/30 disabled:active:scale-100',
  outline:
    'border border-ink/30 text-ink active:bg-ink/5 disabled:text-ink/30 disabled:border-ink/15',
  danger: 'border border-terracotta/40 text-terracotta active:bg-terracotta/10',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-11 rounded-xl px-5 font-display text-base tracking-wide transition-transform ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
