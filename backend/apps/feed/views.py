from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.pagination import CursorPagination

from apps.connections.models import Connection, Follow
from apps.opportunities.models import Opportunity
from apps.opportunities.serializers import OpportunitySerializer


class FeedCursorPagination(CursorPagination):
    ordering = '-created_at'
    page_size = 20


def get_network_user_ids(user):
    connected_ids = Connection.objects.filter(
        Q(sender=user, status='accepted') | Q(receiver=user, status='accepted')
    ).values_list('sender_id', 'receiver_id')
    flat = set()
    for sender_id, receiver_id in connected_ids:
        flat.add(sender_id)
        flat.add(receiver_id)
    flat.discard(user.pk)

    followed_ids = set(Follow.objects.filter(follower=user).values_list('following_id', flat=True))
    return flat | followed_ids


class FeedView(generics.ListAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FeedCursorPagination

    def get_queryset(self):
        network_ids = get_network_user_ids(self.request.user)
        return Opportunity.objects.filter(
            author_id__in=network_ids,
            is_active=True,
        ).select_related('author', 'author__profile').prefetch_related('research_areas', 'bookmarked_by')


class DiscoverView(generics.ListAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FeedCursorPagination

    def get_queryset(self):
        network_ids = get_network_user_ids(self.request.user)
        network_ids.add(self.request.user.pk)
        user_interests = self.request.user.profile.research_interests.all()
        return Opportunity.objects.filter(
            is_active=True,
        ).exclude(
            author_id__in=network_ids,
        ).filter(
            research_areas__in=user_interests,
        ).distinct().select_related(
            'author', 'author__profile'
        ).prefetch_related('research_areas', 'bookmarked_by')
