from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "date_of_birth",
            "height_cm", "weight_kg",
            "daily_calorie_goal", "daily_protein_goal_g",
            "daily_carbs_goal_g", "daily_fat_goal_g",
        ]
        read_only_fields = ["id", "username"]
