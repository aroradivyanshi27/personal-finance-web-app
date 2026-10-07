import {
  UtensilsCrossed,
  Car,
  GraduationCap,
  Clapperboard,
  ShoppingBag,
  ReceiptText,
  Home,
  HeartPulse,
  Repeat,
  Sparkle,
  Wallet,
  Laptop,
  TrendingUp,
  Gift,
  Plus,
  Smartphone,
  Banknote,
  CreditCard,
  Building2,
  PiggyBank,
  Target,
  Trophy,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  PieChart,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  GraduationCap,
  Clapperboard,
  ShoppingBag,
  ReceiptText,
  Home,
  HeartPulse,
  Repeat,
  Sparkle,
  Wallet,
  Laptop,
  TrendingUp,
  Gift,
  Plus,
  Smartphone,
  Banknote,
  CreditCard,
  Building2,
  PiggyBank,
  Target,
  Trophy,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  PieChart,
};

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = 'w-5 h-5' }: IconProps) {
  const LucideIcon = ICON_MAP[name] ?? Sparkle;
  return <LucideIcon className={className} />;
}
