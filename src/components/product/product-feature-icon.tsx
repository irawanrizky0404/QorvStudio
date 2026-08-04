import type { ReactNode } from 'react';
import {
  Calculator, Coins, FileCheck, FileCode, GitPullRequest, HardDrive, History, KeyRound,
  Layers, Lock, MessageSquare, Play, Quote, RefreshCw, Repeat, ScanText, Scale, Search,
  ShieldCheck, Siren, Sparkles, TrendingUp, type LucideProps,
} from 'lucide-react';

/**
 * Allowlist for feature icons. The entity stores a name string, so an unknown
 * value degrades to a neutral glyph rather than breaking the render, and lucide
 * stays tree-shakeable because every import is explicit.
 */
const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  'refresh-cw': RefreshCw, 'file-code': FileCode, 'git-pull-request': GitPullRequest,
  'shield-check': ShieldCheck, layers: Layers, history: History, calculator: Calculator,
  'message-square': MessageSquare, 'trending-up': TrendingUp, siren: Siren, repeat: Repeat,
  search: Search, 'key-round': KeyRound, play: Play, 'hard-drive': HardDrive, quote: Quote,
  'scan-text': ScanText, scale: Scale, lock: Lock, coins: Coins, 'file-check': FileCheck,
};

export function ProductFeatureIcon({
  name, className,
}: { name: string; className?: string }): ReactNode {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
