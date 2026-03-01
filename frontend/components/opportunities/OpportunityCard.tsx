'use client';

import Link from 'next/link';
import { Opportunity } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_TYPE_COLORS } from '@/lib/utils/roleConfig';
import { MapPin, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { opportunitiesApi } from '@/lib/api/opportunities';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const qc = useQueryClient();
  const [bookmarked, setBookmarked] = useState(opportunity.is_bookmarked);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (bookmarked) {
        await opportunitiesApi.removeBookmark(opportunity.id);
      } else {
        await opportunitiesApi.addBookmark(opportunity.id);
      }
      setBookmarked(!bookmarked);
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
    } catch {}
  };

  return (
    <Link href={`/opportunities/${opportunity.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <UserAvatar user={opportunity.author} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{opportunity.author.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{opportunity.author.profile?.institution}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', OPPORTUNITY_TYPE_COLORS[opportunity.opportunity_type])}>
                {OPPORTUNITY_TYPE_LABELS[opportunity.opportunity_type]}
              </span>
              <button
                onClick={toggleBookmark}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                {bookmarked ? <BookmarkCheck className="h-4 w-4 text-indigo-600" /> : <Bookmark className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <h3 className="font-semibold text-slate-900 leading-snug">{opportunity.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">{opportunity.description}</p>

          <div className="flex flex-wrap gap-1">
            {opportunity.research_areas.slice(0, 3).map((area) => (
              <Badge key={area.id} variant="secondary" className="text-xs">{area.name}</Badge>
            ))}
            {opportunity.funding_available && (
              <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">Funded</Badge>
            )}
            {opportunity.is_remote && (
              <Badge variant="outline" className="text-xs">Remote</Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {opportunity.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opportunity.location}</span>
            )}
            {opportunity.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
            <span className="ml-auto">{formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
