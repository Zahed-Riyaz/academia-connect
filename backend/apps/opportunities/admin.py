from django.contrib import admin
from .models import Opportunity, OpportunityBookmark


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'opportunity_type', 'required_role', 'is_active', 'created_at']
    list_filter = ['opportunity_type', 'required_role', 'is_active', 'is_remote', 'funding_available']
    search_fields = ['title', 'description', 'author__email', 'institution']
    raw_id_fields = ['author']


@admin.register(OpportunityBookmark)
class OpportunityBookmarkAdmin(admin.ModelAdmin):
    list_display = ['user', 'opportunity', 'created_at']
    raw_id_fields = ['user', 'opportunity']
