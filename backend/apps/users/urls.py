from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'research-interests', views.ResearchInterestViewSet, basename='research-interest')

urlpatterns = [
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/me/', views.MeView.as_view(), name='user-me'),
    path('users/me/avatar/', views.AvatarUploadView.as_view(), name='user-avatar'),
    path('users/me/publications/', views.PublicationViewSet.as_view({
        'get': 'list', 'post': 'create'
    }), name='my-publications'),
    path('users/me/publications/<int:pk>/', views.PublicationViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    }), name='my-publication-detail'),
    path('users/<int:user_id>/publications/', views.PublicationViewSet.as_view({
        'get': 'list'
    }), name='user-publications'),
    path('', include(router.urls)),
]
