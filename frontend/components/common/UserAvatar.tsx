import { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-16 w-16 text-xl' };

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const initials = ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')) || user.email[0];
  const cls = cn('rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold flex-shrink-0', sizeClasses[size], className);

  if (user.profile?.profile_picture) {
    return (
      <div className={cn(cls, 'overflow-hidden relative')}>
        <Image src={user.profile.profile_picture} alt={user.full_name} fill className="object-cover" />
      </div>
    );
  }

  return <div className={cls}>{initials.toUpperCase()}</div>;
}
