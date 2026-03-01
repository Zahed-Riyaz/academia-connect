from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Connection, Follow
from .serializers import ConnectionSerializer, FollowSerializer


class ConnectionListCreateView(generics.ListCreateAPIView):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Connection.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user),
            status='accepted'
        ).select_related('sender__profile', 'receiver__profile')

    def perform_create(self, serializer):
        receiver = serializer.validated_data['receiver']
        # Prevent duplicate pending requests
        existing = Connection.objects.filter(
            Q(sender=self.request.user, receiver=receiver) |
            Q(sender=receiver, receiver=self.request.user)
        ).first()
        if existing:
            raise serializers.ValidationError("A connection request already exists.")
        serializer.save(sender=self.request.user)


class ConnectionRequestsView(generics.ListAPIView):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Connection.objects.filter(
            receiver=self.request.user, status='pending'
        ).select_related('sender__profile')


class ConnectionSentView(generics.ListAPIView):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Connection.objects.filter(
            sender=self.request.user, status='pending'
        ).select_related('receiver__profile')


class ConnectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return Connection.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        )

    def partial_update(self, request, *args, **kwargs):
        connection = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ('accepted', 'rejected'):
            return Response({'detail': 'Status must be accepted or rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        if connection.receiver != request.user:
            return Response({'detail': 'Only the receiver can accept or reject.'}, status=status.HTTP_403_FORBIDDEN)
        connection.status = new_status
        connection.save()
        return Response(ConnectionSerializer(connection, context={'request': request}).data)


class ConnectionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        me = request.user
        conn = Connection.objects.filter(
            Q(sender=me, receiver_id=user_id) | Q(sender_id=user_id, receiver=me)
        ).first()

        follow_out = Follow.objects.filter(follower=me, following_id=user_id).exists()
        follow_in = Follow.objects.filter(follower_id=user_id, following=me).exists()

        if conn:
            if conn.status == 'accepted':
                rel = 'connected'
            elif conn.sender == me:
                rel = 'pending_sent'
            else:
                rel = 'pending_received'
        elif follow_out and follow_in:
            rel = 'mutual_follow'
        elif follow_out:
            rel = 'following'
        elif follow_in:
            rel = 'followed_by'
        else:
            rel = 'none'

        return Response({'status': rel})


class FollowListCreateView(generics.ListCreateAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user).select_related('following__profile')

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)


class FollowersListView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(following=self.request.user).select_related('follower__profile')


class FollowDestroyView(generics.DestroyAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user)


# Fix missing import
import rest_framework.serializers as serializers  # noqa — used in ConnectionListCreateView
