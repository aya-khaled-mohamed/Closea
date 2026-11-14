import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'rose';
  className?: string;
}

export function Logo({
  size = 'md',
  variant = 'dark',
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-4xl md:text-5xl',
    xl: 'text-5xl md:text-6xl',
  };

  const variantClasses = {
    dark: 'text-closea-ink',
    light: 'text-white',
    rose: 'text-closea-rosewood',
  };

  const content = (
    <span
      className={`font-sans font-extrabold tracking-tight inline-block select-none transition-opacity duration-300 hover:opacity-80 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <span>Clos</span>
      <span className="text-closea-rosewood">é</span>
      <span>a</span>
    </span>
  );

  // اللوجو دايماً هياخدك للهوم بيج
  return (
    <Link href="/" className="inline-flex items-center group focus:outline-none">
      {content}
    </Link>
  );
}

export default Logo;