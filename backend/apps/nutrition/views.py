from datetime import date as date_cls

from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import FoodItem, MealEntry
from .serializers import FoodItemSerializer, MealEntrySerializer, DailySummarySerializer


class FoodItemViewSet(viewsets.ModelViewSet):
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["name", "brand"]

    def get_queryset(self):
        # Global library items + the user's own custom items
        return FoodItem.objects.filter(
            created_by__isnull=True
        ) | FoodItem.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MealEntryViewSet(viewsets.ModelViewSet):
    serializer_class = MealEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["date", "meal_type"]

    def get_queryset(self):
        return MealEntry.objects.filter(user=self.request.user).select_related("food_item")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def daily_summary(self, request):
        """GET /api/nutrition/entries/daily_summary/?date=YYYY-MM-DD"""
        target_date = request.query_params.get("date") or date_cls.today().isoformat()
        entries = self.get_queryset().filter(date=target_date)

        totals = entries.aggregate(
            total_calories=Sum(
                ExpressionWrapper(F("food_item__calories") * F("servings"), output_field=DecimalField())
            ),
            total_protein_g=Sum(
                ExpressionWrapper(F("food_item__protein_g") * F("servings"), output_field=DecimalField())
            ),
            total_carbs_g=Sum(
                ExpressionWrapper(F("food_item__carbs_g") * F("servings"), output_field=DecimalField())
            ),
            total_fat_g=Sum(
                ExpressionWrapper(F("food_item__fat_g") * F("servings"), output_field=DecimalField())
            ),
        )

        user = request.user
        data = {
            "date": target_date,
            "total_calories": round(totals["total_calories"] or 0),
            "total_protein_g": round(float(totals["total_protein_g"] or 0), 1),
            "total_carbs_g": round(float(totals["total_carbs_g"] or 0), 1),
            "total_fat_g": round(float(totals["total_fat_g"] or 0), 1),
            "calorie_goal": user.daily_calorie_goal,
            "protein_goal_g": user.daily_protein_goal_g,
            "carbs_goal_g": user.daily_carbs_goal_g,
            "fat_goal_g": user.daily_fat_goal_g,
            "entries": entries,
        }
        serializer = DailySummarySerializer(data)
        return Response(serializer.data)
