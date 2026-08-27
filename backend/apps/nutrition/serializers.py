from rest_framework import serializers
from .models import FoodItem, MealEntry


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            "id", "name", "brand", "serving_size",
            "calories", "protein_g", "carbs_g", "fat_g",
            "created_by", "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]


class MealEntrySerializer(serializers.ModelSerializer):
    food_item_detail = FoodItemSerializer(source="food_item", read_only=True)
    calories = serializers.ReadOnlyField()
    protein_g = serializers.ReadOnlyField()
    carbs_g = serializers.ReadOnlyField()
    fat_g = serializers.ReadOnlyField()

    class Meta:
        model = MealEntry
        fields = [
            "id", "food_item", "food_item_detail", "meal_type",
            "servings", "date", "logged_at",
            "calories", "protein_g", "carbs_g", "fat_g",
        ]
        read_only_fields = ["id", "logged_at"]


class DailySummarySerializer(serializers.Serializer):
    date = serializers.DateField()
    total_calories = serializers.IntegerField()
    total_protein_g = serializers.FloatField()
    total_carbs_g = serializers.FloatField()
    total_fat_g = serializers.FloatField()
    calorie_goal = serializers.IntegerField()
    protein_goal_g = serializers.IntegerField()
    carbs_goal_g = serializers.IntegerField()
    fat_goal_g = serializers.IntegerField()
    entries = MealEntrySerializer(many=True)
