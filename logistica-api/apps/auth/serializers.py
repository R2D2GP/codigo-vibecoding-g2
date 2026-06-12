from django.contrib.auth.models import Group, Permission, User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_superadmin'] = self.user.is_superuser
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        data['permissions'] = list(self.user.get_all_permissions())
        return data


class PermissionSerializer(serializers.ModelSerializer):
    app_label = serializers.CharField(source='content_type.app_label', read_only=True)

    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name', 'app_label']


class GroupSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Permission.objects.all(),
        source='permissions', required=False,
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_ids']


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Group.objects.all(),
        source='groups', required=False,
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser',
            'groups', 'group_ids', 'date_joined', 'last_login',
        ]
        read_only_fields = ['date_joined', 'last_login']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Group.objects.all(),
        source='groups', required=False,
    )

    class Meta:
        model = User
        fields = [
            'username', 'password', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'group_ids',
        ]

    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        user = User.objects.create_user(**validated_data)
        user.groups.set(groups)
        return user
