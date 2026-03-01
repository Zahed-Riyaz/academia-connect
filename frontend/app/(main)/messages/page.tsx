'use client';

import { useQuery } from '@tanstack/react-query';
import { messagingApi } from '@/lib/api/messaging';
import { Conversation } from '@/lib/types';
import Link from 'next/link';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/lib/providers/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.listConversations().then(r => r.data),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />)}</div>;
  }

  if (!conversations?.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-300" />
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm mt-1">Visit a researcher&apos;s profile to start a conversation.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Messages</h1>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {conversations.map((conv: Conversation) => {
          const other = conv.participants.find(p => p.id !== user?.id);
          if (!other) return null;
          return (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <UserAvatar user={other} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-slate-900 truncate">{other.full_name}</p>
                  {conv.last_message && (
                    <p className="text-xs text-slate-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {conv.last_message?.content || 'No messages yet'}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-medium">
                  {conv.unread_count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
