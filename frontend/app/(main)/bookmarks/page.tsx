'use client';

import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '@/lib/api/opportunities';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => opportunitiesApi.listBookmarks().then(r => r.data),
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Bookmarks</h1>
      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />)}</div>
      ) : (data?.results?.length ?? 0) === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Bookmark className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p>No bookmarks yet. Save opportunities to review them later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.results.map((b: { opportunity: import('@/lib/types').Opportunity }) => (
            <OpportunityCard key={b.opportunity.id} opportunity={b.opportunity} />
          ))}
        </div>
      )}
    </div>
  );
}
