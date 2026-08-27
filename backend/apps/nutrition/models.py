from django.conf import settings
from django.db import models


class FoodItem(models.Model):
    """A reusable food item with nutrition info per serving.
    Can be global (created_by=None, shared library) or user-created."""

    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=200, blank=True)
    serving_size = models.CharField(max_length=50, default="100g")
    calories = models.PositiveIntegerField(help_text="kcal per serving")
    protein_g = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    carbs_g = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    fat_g = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="food_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.serving_size})"


class MealEntry(models.Model):
    class MealType(models.TextChoices):
        BREAKFAST = "breakfast", "Breakfast"
        LUNCH = "lunch", "Lunch"
        DINNER = "dinner", "Dinner"
        SNACK = "snack", "Snack"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meal_entries"
    )
    food_item = models.ForeignKey(
        FoodItem, on_delete=models.CASCADE, related_name="entries"
    )
    meal_type = models.CharField(max_length=20, choices=MealType.choices, default=MealType.SNACK)
    servings = models.DecimalField(max_digits=5, decimal_places=2, default=1)
    date = models.DateField()
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-logged_at"]
        verbose_name_plural = "Meal entries"

    def __str__(self):
        return f"{self.user} - {self.food_item.name} x{self.servings} ({self.date})"

    @property
    def calories(self):
        return round(self.food_item.calories * float(self.servings))

    @property
    def protein_g(self):
        return round(float(self.food_item.protein_g) * float(self.servings), 1)

    @property
    def carbs_g(self):
        return round(float(self.food_item.carbs_g) * float(self.servings), 1)

    @property
    def fat_g(self):
        return round(float(self.food_item.fat_g) * float(self.servings), 1)
