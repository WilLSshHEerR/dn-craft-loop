import { useEffect } from 'react';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { useOnceInView } from './hooks';

type RevealProps = {
  as?: ElementType;
  delay?: number;
  className?: string;
  children?: ReactNode;
  onReveal?: () => void;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

/** Fade + slide al entrar en pantalla, con escalonado mediante `delay` (ms). */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', onReveal, children, style, ...rest }: RevealProps) {
  const { ref, seen } = useOnceInView<HTMLElement>();

  useEffect(() => {
    if (seen) onReveal?.();
  }, [seen, onReveal]);

  return (
    <Tag
      ref={ref}
      className={`rv ${seen ? 'in' : ''} ${className}`}
      style={{ ...style, '--d': `${delay}ms` } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

