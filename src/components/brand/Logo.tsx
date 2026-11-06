import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'rose';
  href?: string;
  className?: string;
}

export function Logo({
  size = 'md',
  variant = 'dark',
  href = '/',
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl tracking-[0.14em]',
    md: 'text-2xl md:text-3xl tracking-[0.16em]',
    lg: 'text-4xl md:text-5xl tracking-[0.18em]',
    xl: 'text-5xl md:text-6xl tracking-[0.2em]',
  };

  const variantClasses = {
    dark: 'text-closea-grey',
    light: 'text-white',
    rose: 'text-[#8B5E56]',
  };

  const content = (
    <span
      className={`font-editorial font-normal inline-block select-none transition-opacity duration-300 hover:opacity-90 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={{ fontFeatureSettings: '"kern", "liga"' }}
    >
      <span className="capitalize">Clos</span>
      <span className="italic font-light text-[#8B5E56]">é</span>
      <span>a</span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center group focus:outline-none">
      {content}
    </Link>
  );
}

export default Logo;
