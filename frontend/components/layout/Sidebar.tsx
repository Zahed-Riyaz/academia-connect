'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, Briefcase, Users, MessageSquare,
  Bookmark, Search, LogOut, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { href: '/connections', label: 'Connections', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/search', label: 'Search', icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-slate-200 py-6 px-3 fixed top-0 left-0">
      <Link href="/feed" className="flex items-center gap-2 px-3 mb-8">
        <GraduationCap className="h-7 w-7 text-indigo-600" />
        <span className="font-bold text-lg text-slate-900">Academia Connect</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 pt-4 mt-4">
        {user && (
          <Link href="/profile/me" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
              {(user.first_name?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || user.email}</p>
              <p className="text-xs text-slate-500 truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </Link>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-slate-600" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
