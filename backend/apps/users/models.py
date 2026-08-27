from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user, so we can add fitness-specific profile fields later
    without a painful migration off the default auth model."""

    date_of_birth = models.DateField(null=True, blank=True)
    height_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)

    # Daily nutrition goals
    daily_calorie_goal = models.PositiveIntegerField(default=2000)
    daily_protein_goal_g = models.PositiveIntegerField(default=150)
    daily_carbs_goal_g = models.PositiveIntegerField(default=200)
    daily_fat_goal_g = models.PositiveIntegerField(default=65)

    def __str__(self):
        return self.username
