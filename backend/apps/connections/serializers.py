from rest_framework import serializers
from .models import Connection, Follow
from apps.users.serializers import UserSerializer


class ConnectionSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source='receiver',
        queryset=__import__('apps.users.models', fromlist=['User']).User.objects.all()
    )

    class Meta:
        model = Connection
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'status', 'created_at', 'updated_at']

    def validate_receiver_id(self, value):
        request = self.context['request']
        if value == request.user:
            raise serializers.ValidationError("You cannot connect with yourself.")
        return value


class ConnectionStatusSerializer(serializers.Serializer):
    status = serializers.CharField()


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source='following',
        queryset=__import__('apps.users.models', fromlist=['User']).User.objects.all()
    )

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'user_id', 'created_at']
        read_only_fields = ['id', 'follower', 'following', 'created_at']

    def validate_user_id(self, value):
        if value == self.context['request'].user:
            raise serializers.ValidationError("You cannot follow yourself.")
        return value
