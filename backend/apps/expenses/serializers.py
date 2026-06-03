from rest_framework import serializers
from .models import Expense, EXPENSE_CATEGORIES

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Expense
        fields = ('id', 'description', 'amount', 'category', 'category_display', 'date', 
                  'receipt', 'ai_insights', 'ai_confidence', 'tags', 'created_at', 'updated_at')

class ExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ('description', 'amount', 'category', 'date', 'receipt', 'tags')
