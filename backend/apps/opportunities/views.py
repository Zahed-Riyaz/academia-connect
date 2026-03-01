from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Opportunity, OpportunityBookmark
from .serializers import OpportunitySerializer, OpportunityBookmarkSerializer
from .filters import OpportunityFilter
from apps.users.permissions import IsOwnerOrReadOnly


class OpportunityListCreateView(generics.ListCreateAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = OpportunityFilter
    search_fields = ['title', 'description', 'institution']
    ordering_fields = ['created_at', 'deadline']

    def get_queryset(self):
        return Opportunity.objects.filter(is_active=True).select_related(
            'author', 'author__profile'
        ).prefetch_related('research_areas', 'bookmarked_by')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class OpportunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return Opportunity.objects.select_related(
            'author', 'author__profile'
        ).prefetch_related('research_areas', 'bookmarked_by')


class MyOpportunitiesView(generics.ListAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Opportunity.objects.filter(author=self.request.user).select_related(
            'author', 'author__profile'
        ).prefetch_related('research_areas')


class BookmarkListCreateView(generics.ListCreateAPIView):
    serializer_class = OpportunityBookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OpportunityBookmark.objects.filter(user=self.request.user).select_related(
            'opportunity__author', 'opportunity__author__profile'
        ).prefetch_related('opportunity__research_areas')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookmarkDestroyView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OpportunityBookmark.objects.filter(user=self.request.user)

    def get_object(self):
        return generics.get_object_or_404(
            OpportunityBookmark,
            user=self.request.user,
            opportunity_id=self.kwargs['opportunity_id']
        )
