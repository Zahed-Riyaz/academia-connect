from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import CursorPagination

from apps.users.models import User
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class MessageCursorPagination(CursorPagination):
    ordering = 'created_at'
    page_size = 50


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.prefetch_related(
            'participants__profile', 'messages'
        ).order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        other_user_id = request.data.get('user_id')
        try:
            other_user = User.objects.get(pk=other_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if other_user == request.user:
            return Response({'detail': 'Cannot message yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing conversation between these two users
        existing = request.user.conversations.filter(participants=other_user).first()
        if existing:
            return Response(ConversationSerializer(existing, context={'request': request}).data)

        conversation = Conversation.objects.create()
        conversation.participants.set([request.user, other_user])
        return Response(
            ConversationSerializer(conversation, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.prefetch_related('participants__profile', 'messages')


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessageCursorPagination

    def get_conversation(self):
        return generics.get_object_or_404(
            self.request.user.conversations,
            pk=self.kwargs['conversation_id']
        )

    def get_queryset(self):
        conversation = self.get_conversation()
        # Mark messages as read when fetched
        conversation.messages.filter(is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)
        return conversation.messages.select_related('sender', 'sender__profile')

    def perform_create(self, serializer):
        conversation = self.get_conversation()
        message = serializer.save(sender=self.request.user, conversation=conversation)
        # Bump conversation updated_at
        conversation.save()
        return message


class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__in=request.user.conversations.all(),
            is_read=False,
        ).exclude(sender=request.user).count()
        return Response({'unread_count': count})
