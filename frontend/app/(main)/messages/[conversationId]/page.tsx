'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingApi } from '@/lib/api/messaging';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Message } from '@/lib/types';

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const id = Number(conversationId);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conv } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => messagingApi.getConversation(id).then(r => r.data),
  });

  const { data: messagesData } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => messagingApi.getMessages(id).then(r => r.data),
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => messagingApi.sendMessage(id, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      setContent('');
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const handleSend = () => {
    const text = content.trim();
    if (!text) return;
    sendMutation.mutate(text);
  };

  const other = conv?.participants.find(p => p.id !== user?.id);
  const messages = messagesData?.results ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 mb-4">
        <Link href="/messages" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {other && (
          <>
            <UserAvatar user={other} size="sm" />
            <div>
              <p className="font-semibold text-sm text-slate-900">{other.full_name}</p>
              <p className="text-xs text-slate-500">{other.profile?.institution}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg: Message) => {
          const isMe = msg.sender.id === user?.id;
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                isMe
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
              )}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-200">
        <Input
          placeholder="Type a message…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!content.trim() || sendMutation.isPending} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
