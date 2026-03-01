'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '@/lib/api/feed';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { useInView } from 'react-intersection-observer';
import { Opportunity } from '@/lib/types';

export default function FeedPage() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => feedApi.getFeed(pageParam as string | undefined).then(r => r.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      return new URL(lastPage.next).searchParams.get('cursor') ?? undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const opportunities = data?.pages.flatMap((p) => p.results) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg font-medium">Your feed is empty</p>
        <p className="text-sm mt-1">Connect with researchers or follow people to see their opportunities here.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Your Feed</h1>
      <div className="space-y-4">
        {opportunities.map((opp: Opportunity) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
        {hasNextPage && <div ref={ref} className="h-10" />}
        {isFetchingNextPage && <div className="h-12 rounded-xl bg-slate-200 animate-pulse" />}
      </div>
    </div>
  );
}
