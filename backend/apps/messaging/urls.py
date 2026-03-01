from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListCreateView.as_view(), name='conversation-list'),
    path('conversations/unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListCreateView.as_view(), name='message-list'),
]
