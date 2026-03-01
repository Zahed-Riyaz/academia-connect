from rest_framework import generics, viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import User, UserProfile, ResearchInterest, Publication
from .serializers import UserSerializer, UserMeSerializer, ResearchInterestSerializer, PublicationSerializer
from .permissions import IsOwnerOrReadOnly
from .filters import UserFilter


class UserListView(generics.ListAPIView):
    queryset = User.objects.select_related('profile').prefetch_related(
        'profile__research_interests'
    ).order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = UserFilter
    search_fields = ['first_name', 'last_name', 'username', 'profile__institution', 'profile__bio']
    ordering_fields = ['date_joined', 'first_name', 'last_name']


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.select_related('profile').prefetch_related(
        'profile__research_interests', 'publications'
    )
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserMeSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return self.request.user


class AvatarUploadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser]

    def post(self, request):
        profile = request.user.profile
        if 'profile_picture' not in request.FILES:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        profile.profile_picture = request.FILES['profile_picture']
        profile.save()
        return Response({'profile_picture': profile.profile_picture.url}, status=status.HTTP_200_OK)


class PublicationViewSet(viewsets.ModelViewSet):
    serializer_class = PublicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            return Publication.objects.filter(user_id=user_id)
        return Publication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResearchInterestViewSet(viewsets.ModelViewSet):
    queryset = ResearchInterest.objects.all()
    serializer_class = ResearchInterestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name']
    http_method_names = ['get', 'post', 'head', 'options']
