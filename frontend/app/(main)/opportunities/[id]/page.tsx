'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '@/lib/api/opportunities';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_TYPE_COLORS } from '@/lib/utils/roleConfig';
import { MapPin, Calendar, Globe, Mail, Bookmark, BookmarkCheck, ArrowLeft, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState } from 'react';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);

  const { data: opp, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.get(Number(id)).then(r => r.data),
    select: (data) => { if (bookmarked === null) setBookmarked(data.is_bookmarked); return data; },
  });

  const deleteMutation = useMutation({
    mutationFn: () => opportunitiesApi.delete(Number(id)),
    onSuccess: () => { toast.success('Opportunity deleted'); router.push('/opportunities'); },
  });

  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        await opportunitiesApi.removeBookmark(Number(id));
        setBookmarked(false);
      } else {
        await opportunitiesApi.addBookmark(Number(id));
        setBookmarked(true);
      }
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
    } catch {}
  };

  if (isLoading) return <div className="space-y-4"><div className="h-10 w-20 bg-slate-200 rounded animate-pulse" /><div className="h-64 rounded-xl bg-slate-200 animate-pulse" /></div>;
  if (!opp) return <p className="text-center py-12 text-slate-500">Opportunity not found.</p>;

  const isAuthor = user?.id === opp.author.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', OPPORTUNITY_TYPE_COLORS[opp.opportunity_type])}>
          {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type]}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{opp.title}</h1>
          <div className="flex gap-2 flex-shrink-0">
            {isAuthor ? (
              <>
                <Button size="sm" variant="outline" asChild><Link href={`/opportunities/${id}/edit`}><Pencil className="h-4 w-4 mr-1.5" />Edit</Link></Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>Delete</Button>
              </>
            ) : (
              <button onClick={toggleBookmark} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                {bookmarked ? <BookmarkCheck className="h-5 w-5 text-indigo-600" /> : <Bookmark className="h-5 w-5 text-slate-400" />}
              </button>
            )}
          </div>
        </div>

        <Link href={`/profile/${opp.author.id}`} className="flex items-center gap-3 hover:opacity-80">
          <UserAvatar user={opp.author} size="sm" />
          <div>
            <p className="text-sm font-medium text-slate-900">{opp.author.full_name}</p>
            <RoleBadge role={opp.author.role} />
          </div>
        </Link>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {opp.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{opp.location}</span>}
          {opp.is_remote && <Badge variant="outline">Remote</Badge>}
          {opp.deadline && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>}
          {opp.funding_available && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Funded{opp.stipend_details ? ` · ${opp.stipend_details}` : ''}</Badge>}
        </div>

        {opp.research_areas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {opp.research_areas.map((a) => <Badge key={a.id} variant="secondary">{a.name}</Badge>)}
          </div>
        )}

        <div className="prose prose-sm max-w-none text-slate-700">
          <p className="whitespace-pre-wrap">{opp.description}</p>
        </div>

        {(opp.contact_email || opp.external_url) && (
          <div className="flex gap-4 pt-2 border-t border-slate-100">
            {opp.contact_email && <a href={`mailto:${opp.contact_email}`} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"><Mail className="h-4 w-4" />{opp.contact_email}</a>}
            {opp.external_url && <a href={opp.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"><Globe className="h-4 w-4" />Application link</a>}
          </div>
        )}
      </div>
    </div>
  );
}
