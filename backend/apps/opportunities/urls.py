from django.urls import path
from . import views

urlpatterns = [
    path('opportunities/', views.OpportunityListCreateView.as_view(), name='opportunity-list'),
    path('opportunities/my/', views.MyOpportunitiesView.as_view(), name='my-opportunities'),
    path('opportunities/<int:pk>/', views.OpportunityDetailView.as_view(), name='opportunity-detail'),
    path('bookmarks/', views.BookmarkListCreateView.as_view(), name='bookmark-list'),
    path('bookmarks/<int:opportunity_id>/', views.BookmarkDestroyView.as_view(), name='bookmark-destroy'),
]
