import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary:   'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-glow-sm hover:shadow-glow',
  secondary: 'bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-700/80 text-slate-300 hover:text-white',
  ghost:     'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200',
  danger:    'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-glow-rose',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold
        transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[.97]
        ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
