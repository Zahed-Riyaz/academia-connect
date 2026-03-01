'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsApi } from '@/lib/api/connections';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Connection } from '@/lib/types';

export default function ConnectionsPage() {
  const qc = useQueryClient();

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.listConnections().then(r => r.data),
  });
  const { data: requests } = useQuery({
    queryKey: ['connection-requests'],
    queryFn: () => connectionsApi.getPendingRequests().then(r => r.data),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'accepted' | 'rejected' }) =>
      connectionsApi.updateConnection(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
      qc.invalidateQueries({ queryKey: ['connection-requests'] });
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Connections</h1>
      <Tabs defaultValue="connections">
        <TabsList className="mb-6">
          <TabsTrigger value="connections">My Connections ({connections?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="requests">
            Requests {(requests?.length ?? 0) > 0 && <span className="ml-1.5 bg-indigo-600 text-white text-xs rounded-full px-1.5">{requests!.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          {connections?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p>No connections yet. Discover researchers and send connection requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {connections?.map((conn: Connection) => {
                const other = conn.sender.id === conn.receiver.id ? conn.sender : conn.receiver;
                return (
                  <Link key={conn.id} href={`/profile/${other.id}`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
                    <UserAvatar user={other} size="md" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{other.full_name}</p>
                      <RoleBadge role={other.role} className="mt-0.5" />
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{other.profile?.institution}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requests?.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {requests?.map((req: Connection) => (
                <div key={req.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <Link href={`/profile/${req.sender.id}`}>
                    <UserAvatar user={req.sender} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${req.sender.id}`} className="font-medium text-sm text-slate-900 hover:underline truncate block">{req.sender.full_name}</Link>
                    <RoleBadge role={req.sender.role} className="mt-0.5" />
                    <p className="text-xs text-slate-500 truncate">{req.sender.profile?.institution}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => respondMutation.mutate({ id: req.id, status: 'accepted' })}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => respondMutation.mutate({ id: req.id, status: 'rejected' })}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
