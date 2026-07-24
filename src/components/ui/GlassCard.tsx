import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'sunken' | 'interactive';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  noBorder?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  noBorder = false,
  className = '',
  whileHover,
  whileTap,
  ...rest
}) => {
  const { themeTokens, isLight } = useTheme();

  const paddingClasses = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-7',
    xl: 'p-9',
  };

  const variantClasses = {
    default: `${themeTokens.cardBg} ${noBorder ? '' : themeTokens.cardBorder}`,
    elevated: isLight
      ? 'bg-white/90 border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl'
      : 'bg-[#18181c]/90 border border-white/[0.14] shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl',
    sunken: isLight
      ? 'bg-black/[0.03] border border-black/[0.06] shadow-inner backdrop-blur-md'
      : 'bg-black/[0.3] border border-white/[0.06] shadow-inner backdrop-blur-md',
    interactive: `${themeTokens.cardBg} ${noBorder ? '' : themeTokens.cardBorder} hover:scale-[1.01] transition-all cursor-pointer`,
  };

  return (
    <motion.div
      whileHover={whileHover || (variant === 'interactive' ? { y: -2 } : undefined)}
      whileTap={whileTap || (variant === 'interactive' ? { scale: 0.99 } : undefined)}
      className={`rounded-2xl md:rounded-3xl transition-all duration-300 ${paddingClasses[padding]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
