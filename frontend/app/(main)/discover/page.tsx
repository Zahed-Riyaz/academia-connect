'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '@/lib/api/feed';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Opportunity } from '@/lib/types';

export default function DiscoverPage() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['discover'],
    queryFn: ({ pageParam }) => feedApi.getDiscover(pageParam as string | undefined).then(r => r.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      return new URL(lastPage.next).searchParams.get('cursor') ?? undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const opportunities = data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Discover</h1>
      <p className="text-sm text-slate-500 mb-6">Opportunities matching your research interests, outside your network</p>
      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp: Opportunity) => <OpportunityCard key={opp.id} opportunity={opp} />)}
          {opportunities.length === 0 && <p className="text-center text-slate-500 py-12">No matching opportunities found outside your network yet.</p>}
          {hasNextPage && <div ref={ref} className="h-10" />}
          {isFetchingNextPage && <div className="h-12 rounded-xl bg-slate-200 animate-pulse" />}
        </div>
      )}
    </div>
  );
}
