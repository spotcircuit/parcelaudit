'use client';

import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
  objectFit = 'cover',
}: OptimizedImageProps) {
  // Generate WebP path from PNG path
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  // For priority images, use eager loading
  const loadingAttr = priority ? 'eager' : loading;

  // Default responsive classes if none provided
  const defaultClasses = 'max-w-full h-auto';
  const finalClassName = `${defaultClasses} ${className}`;

  // Style object for object-fit
  const imgStyle: React.CSSProperties = {
    objectFit,
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
  };

  return (
    <picture className="block">
      <source 
        srcSet={webpSrc} 
        type="image/webp"
        sizes={sizes}
      />
      <source 
        srcSet={src} 
        type={src.endsWith('.png') ? 'image/png' : 'image/jpeg'}
        sizes={sizes}
      />
      <img
        src={src}
        alt={alt}
        className={finalClassName}
        loading={loadingAttr}
        decoding="async"
        style={imgStyle}
        sizes={sizes}
      />
    </picture>
  );
}