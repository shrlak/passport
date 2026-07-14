import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'outline' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-teal text-white shadow-[0_4px_12px_rgba(0,113,227,0.2)] disabled:bg-ink/20 disabled:shadow-none',
  outline: 'border border-ink/12 bg-white text-ink shadow-sm active:bg-paper disabled:text-ink/30 disabled:border-ink/8',
  danger: 'border border-terracotta/20 bg-white text-terracotta shadow-sm active:bg-terracotta/5',
};

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: HTMLMotionProps<'button'> & { variant?: Variant }) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={`min-h-11 rounded-full px-5 text-[15px] font-semibold tracking-[-0.01em] transition-colors ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
