from rest_framework import serializers
from .models import User, UserProfile, ResearchInterest, Publication


class ResearchInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchInterest
        fields = ['id', 'name', 'slug']


class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = ['id', 'title', 'authors', 'publication_type', 'venue', 'year', 'doi', 'url', 'abstract', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    research_interests = ResearchInterestSerializer(many=True, read_only=True)
    research_interest_ids = serializers.PrimaryKeyRelatedField(
        queryset=ResearchInterest.objects.all(),
        many=True,
        write_only=True,
        source='research_interests',
        required=False,
    )

    class Meta:
        model = UserProfile
        fields = [
            'bio', 'profile_picture', 'institution', 'department',
            'website', 'google_scholar_url', 'orcid_id', 'linkedin_url',
            'location', 'research_interests', 'research_interest_ids',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    publications = PublicationSerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'role', 'profile', 'publications', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserMeSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'profile']
        read_only_fields = ['id', 'email', 'role']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        research_interests = profile_data.pop('research_interests', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        if research_interests is not None:
            profile.research_interests.set(research_interests)
        profile.save()

        return instance
