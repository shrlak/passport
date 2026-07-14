import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'outline' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-ink text-white shadow-[0_9px_24px_rgba(18,22,32,0.2)] disabled:bg-ink/20 disabled:shadow-none',
  outline: 'border border-white/80 bg-white/82 text-ink shadow-[0_7px_20px_rgba(24,32,52,0.08)] backdrop-blur-xl active:bg-paper disabled:text-ink/30 disabled:border-ink/8',
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
      className={`min-h-11 rounded-[15px] px-5 text-[15px] font-semibold tracking-[-0.01em] transition-colors ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
