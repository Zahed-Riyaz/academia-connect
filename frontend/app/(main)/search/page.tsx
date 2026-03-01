'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { User } from '@/lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['search-users', query],
    queryFn: () => usersApi.listUsers({ search: query }).then(r => r.data),
    enabled: query.length >= 2,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Search Researchers</h1>
      <Input
        placeholder="Search by name, institution, or research area…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6"
      />

      {query.length < 2 && (
        <div className="text-center py-16 text-slate-400">
          <Search className="h-10 w-10 mx-auto mb-3" />
          <p>Type at least 2 characters to search</p>
        </div>
      )}

      {isLoading && query.length >= 2 && (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />)}</div>
      )}

      {data && (
        <div className="space-y-2">
          {data.results.length === 0 && <p className="text-center text-slate-500 py-8">No researchers found.</p>}
          {data.results.map((user: User) => (
            <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
              <UserAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900">{user.full_name}</p>
                <RoleBadge role={user.role} className="mt-0.5" />
                {user.profile?.institution && <p className="text-xs text-slate-500 mt-0.5 truncate">{user.profile.institution}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
