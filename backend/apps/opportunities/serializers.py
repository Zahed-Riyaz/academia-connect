from rest_framework import serializers
from .models import Opportunity, OpportunityBookmark
from apps.users.serializers import UserSerializer, ResearchInterestSerializer


class OpportunitySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    research_areas = ResearchInterestSerializer(many=True, read_only=True)
    research_area_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, source='research_areas',
        queryset=__import__('apps.users.models', fromlist=['ResearchInterest']).ResearchInterest.objects.all(),
        required=False,
    )
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity
        fields = [
            'id', 'author', 'opportunity_type', 'title', 'description',
            'institution', 'location', 'is_remote', 'required_role',
            'research_areas', 'research_area_ids', 'funding_available',
            'stipend_details', 'deadline', 'contact_email', 'external_url',
            'is_active', 'is_bookmarked', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(user=request.user).exists()
        return False


class OpportunityBookmarkSerializer(serializers.ModelSerializer):
    opportunity = OpportunitySerializer(read_only=True)
    opportunity_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source='opportunity',
        queryset=Opportunity.objects.all()
    )

    class Meta:
        model = OpportunityBookmark
        fields = ['id', 'opportunity', 'opportunity_id', 'created_at']
        read_only_fields = ['id', 'created_at']
