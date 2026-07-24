import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { soundEngine } from '../../utils/audio';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon' | 'toolbar' | 'fab';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  active = false,
  disabled = false,
  className = '',
  onClick,
  ...rest
}) => {
  const { themeTokens, isLight } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    soundEngine.playClick();
    if (onClick) onClick(e);
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-2',
    md: 'px-4.5 py-2.5 text-xs font-semibold rounded-2xl gap-2',
    lg: 'px-6 py-3.5 text-sm font-semibold rounded-2xl gap-2.5',
  };

  const variantClasses = {
    primary: `${themeTokens.accentBg} ${themeTokens.accentText === 'text-cyan-400' ? 'text-slate-950 font-bold' : 'text-white font-semibold'} shadow-md`,
    secondary: isLight
      ? 'bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F] border border-black/[0.08] active:bg-black/[0.12]'
      : 'bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F5F7] border border-white/[0.1] active:bg-white/[0.18]',
    ghost: isLight
      ? 'bg-transparent hover:bg-black/[0.05] text-[#1D1D1F] active:bg-black/[0.08]'
      : 'bg-transparent hover:bg-white/[0.08] text-[#F5F5F7] active:bg-white/[0.12]',
    destructive: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 active:bg-rose-700',
    icon: isLight
      ? 'p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] border border-black/[0.08]'
      : 'p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F5F5F7] border border-white/[0.1]',
    toolbar: active
      ? `${themeTokens.accentSoft} ${themeTokens.accentText} font-bold border ${themeTokens.accentBorder}`
      : isLight
      ? 'bg-black/[0.03] hover:bg-black/[0.06] text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.06]'
      : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#A1A1A6] hover:text-[#F5F5F7] border border-white/[0.08]',
    fab: `${themeTokens.accentBg} text-white p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95`,
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
        variant !== 'icon' && variant !== 'fab' ? sizeClasses[size] : ''
      } ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </motion.button>
  );
};
