from rest_framework.routers import DefaultRouter
from .views import FoodItemViewSet, MealEntryViewSet

router = DefaultRouter()
router.register("foods", FoodItemViewSet, basename="fooditem")
router.register("entries", MealEntryViewSet, basename="mealentry")

urlpatterns = router.urls
