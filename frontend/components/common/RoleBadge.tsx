import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/utils/roleConfig';

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', ROLE_COLORS[role], className)}>
      {ROLE_LABELS[role]}
    </span>
  );
}
