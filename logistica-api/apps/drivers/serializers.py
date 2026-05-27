from rest_framework import serializers
from .models import Driver


class DriverSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True, help_text='Correo electrónico del usuario asociado')
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True, help_text='Nombre completo del usuario asociado')

    class Meta:
        model = Driver
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
