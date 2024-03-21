# myapp/serializers.py

from rest_framework import serializers
from .models import RequestUser
# from .models import Task

#Serialiser to create a user
class RequestUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestUser
        fields = ['id','email', 'first_name', 'last_name', 'password','user_type','is_active','church']


    def create(self, validated_data):
        user = RequestUser.objects.create_superuser(**validated_data)
        return user