import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
  subtext?: string;
  centered?: boolean;
}

export function BrandLogo({
  variant = 'dark',
  size = 'md',
  showSubtext = false,
  subtext = 'Powered by ProEdge Software Solutions',
  centered = false,
}: BrandLogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#2C2520]';
  const subtextColor = variant === 'light' ? 'text-white/75' : 'text-[#7A6F67]';
  const strokeColor = variant === 'light' ? '#E5C687' : '#B8925A';

  const dimensions = {
    sm: { icon: 24, title: 'text-xl', sub: 'text-[10px]' },
    md: { icon: 32, title: 'text-2xl', sub: 'text-xs' },
    lg: { icon: 44, title: 'text-4xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`inline-flex flex-col ${centered ? 'items-center text-center' : 'items-start'}`}>
      <div className="flex items-center gap-2.5">
        {/* Minimalist Interlocking Hearts Emblem */}
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16.5 31.5C16.5 31.5 5 23.8 5 14.8C5 10.6 8.2 7.5 12.1 7.5C14.5 7.5 16.5 8.8 17.5 10.6C18.5 8.8 20.5 7.5 22.9 7.5C26.8 7.5 30 10.6 30 14.8C30 23.8 18.5 31.5 16.5 31.5Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23.5 33.5C23.5 33.5 12 25.8 12 16.8C12 12.6 15.2 9.5 19.1 9.5C21.5 9.5 23.5 10.8 24.5 12.6C25.5 10.8 27.5 9.5 29.9 9.5C33.8 9.5 37 12.6 37 16.8C37 25.8 25.5 33.5 23.5 33.5Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
        </svg>
        <span className={`font-serif font-semibold tracking-wide ${dimensions.title} ${textColor}`}>
          OneHearts
        </span>
      </div>
      {showSubtext && subtext && (
        <span className={`italic tracking-wider mt-0.5 ${dimensions.sub} ${subtextColor}`}>
          {subtext}
        </span>
      )}
    </div>
  );
}