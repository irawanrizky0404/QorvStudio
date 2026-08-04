import type { ReactNode } from 'react';
import { Box, Code, Compass, LayoutGrid, Package, Shapes, Sparkles, type LucideProps } from 'lucide-react';

/**
 * Icon allowlist. Entity data stores a name string, so an unknown value falls
 * back rather than rendering nothing, and lucide stays tree-shakeable.
 */
const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  code: Code,
  box: Box,
  package: Package,
  shapes: Shapes,
  layout: LayoutGrid,
  compass: Compass,
};

export function ServiceIcon({
  name,
  className,
  strokeWidth = 1.5,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}): ReactNode {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
