from django.urls import path
from .views import FeedView, DiscoverView

urlpatterns = [
    path('feed/', FeedView.as_view(), name='feed'),
    path('feed/discover/', DiscoverView.as_view(), name='feed-discover'),
]
