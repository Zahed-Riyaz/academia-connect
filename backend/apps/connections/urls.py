from django.urls import path
from . import views

urlpatterns = [
    path('connections/', views.ConnectionListCreateView.as_view(), name='connection-list'),
    path('connections/requests/', views.ConnectionRequestsView.as_view(), name='connection-requests'),
    path('connections/sent/', views.ConnectionSentView.as_view(), name='connection-sent'),
    path('connections/<int:pk>/', views.ConnectionDetailView.as_view(), name='connection-detail'),
    path('connections/status/<int:user_id>/', views.ConnectionStatusView.as_view(), name='connection-status'),
    path('follows/', views.FollowListCreateView.as_view(), name='follow-list'),
    path('follows/followers/', views.FollowersListView.as_view(), name='followers-list'),
    path('follows/<int:pk>/', views.FollowDestroyView.as_view(), name='follow-destroy'),
]
