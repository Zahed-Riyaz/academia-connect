'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { connectionsApi } from '@/lib/api/connections';
import { messagingApi } from '@/lib/api/messaging';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Globe, ExternalLink, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const isMe = me?.id === id;

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id).then(r => r.data),
  });

  const { data: connStatus } = useQuery({
    queryKey: ['connection-status', id],
    queryFn: () => connectionsApi.getStatus(id).then(r => r.data),
    enabled: !isMe,
  });

  const connectMutation = useMutation({
    mutationFn: () => connectionsApi.sendRequest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['connection-status', id] }); toast.success('Connection request sent'); },
  });

  const followMutation = useMutation({
    mutationFn: () => connectionsApi.follow(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['connection-status', id] }); toast.success('Now following'); },
  });

  const messageMutation = useMutation({
    mutationFn: () => messagingApi.startConversation(id),
    onSuccess: (res) => router.push(`/messages/${res.data.id}`),
  });

  if (isLoading) {
    return <div className="space-y-4"><div className="h-40 rounded-xl bg-slate-200 animate-pulse" /><div className="h-64 rounded-xl bg-slate-200 animate-pulse" /></div>;
  }
  if (!user) return <p className="text-center text-slate-500 py-12">User not found.</p>;

  const status = connStatus?.status;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.full_name}</h1>
              <RoleBadge role={user.role} className="mt-1" />
              {user.profile?.institution && (
                <p className="text-sm text-slate-600 mt-1">{user.profile.institution}{user.profile.department ? ` · ${user.profile.department}` : ''}</p>
              )}
              {user.profile?.location && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{user.profile.location}</p>
              )}
            </div>
          </div>
          {!isMe && (
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => messageMutation.mutate()} disabled={messageMutation.isPending}>
                <MessageSquare className="h-4 w-4 mr-1.5" />Message
              </Button>
              {(status === 'none' || status === 'followed_by') && (
                <Button size="sm" onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending}>Connect</Button>
              )}
              {status === 'pending_sent' && <Button size="sm" variant="outline" disabled>Pending</Button>}
              {status === 'connected' && <Button size="sm" variant="outline" disabled>Connected</Button>}
              {(status === 'none' || status === 'pending_sent' || status === 'pending_received') && (
                <Button size="sm" variant="ghost" onClick={() => followMutation.mutate()} disabled={followMutation.isPending}>Follow</Button>
              )}
            </div>
          )}
          {isMe && (
            <Button size="sm" variant="outline" onClick={() => router.push('/profile/me/edit')}>Edit profile</Button>
          )}
        </div>
        {user.profile?.bio && <p className="text-sm text-slate-700 mt-4 leading-relaxed">{user.profile.bio}</p>}
        {user.profile?.research_interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {user.profile.research_interests.map((i) => (
              <Badge key={i.id} variant="secondary">{i.name}</Badge>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-4">
          {user.profile?.website && <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"><Globe className="h-3 w-3" />Website</a>}
          {user.profile?.google_scholar_url && <a href={user.profile.google_scholar_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"><ExternalLink className="h-3 w-3" />Google Scholar</a>}
          {user.profile?.orcid_id && <span className="text-xs text-slate-500">ORCID: {user.profile.orcid_id}</span>}
        </div>
      </div>

      <Tabs defaultValue="publications">
        <TabsList>
          <TabsTrigger value="publications">Publications ({user.publications?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="publications" className="space-y-3 mt-4">
          {user.publications?.length === 0 && <p className="text-slate-500 text-sm">No publications listed.</p>}
          {user.publications?.map((pub) => (
            <div key={pub.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm text-slate-900">{pub.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pub.authors} · {pub.venue} · {pub.year}</p>
                </div>
                {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"><ExternalLink className="h-4 w-4" /></a>}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
