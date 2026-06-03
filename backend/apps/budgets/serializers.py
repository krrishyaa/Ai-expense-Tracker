from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    period_display = serializers.CharField(source='get_period_display', read_only=True)

    class Meta:
        model = Budget
        fields = ('id', 'category', 'category_display', 'amount', 'period', 'period_display',
                  'alert_threshold', 'is_active', 'created_at', 'updated_at')
