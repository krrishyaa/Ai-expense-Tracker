from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import timedelta
from .models import Budget
from .serializers import BudgetSerializer
from apps.expenses.models import Expense

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def spending_status(self, request):
        budgets = self.get_queryset()
        status_data = []

        for budget in budgets:
            expenses = Expense.objects.filter(user=request.user, category=budget.category)
            
            # Calculate spending for the period
            today = timezone.now().date()
            if budget.period == 'daily':
                expenses = expenses.filter(date=today)
            elif budget.period == 'weekly':
                week_start = today - timedelta(days=today.weekday())
                expenses = expenses.filter(date__gte=week_start)
            elif budget.period == 'monthly':
                expenses = expenses.filter(date__year=today.year, date__month=today.month)
            elif budget.period == 'yearly':
                expenses = expenses.filter(date__year=today.year)

            total_spent = sum(e.amount for e in expenses)
            percentage = (float(total_spent) / float(budget.amount)) * 100 if budget.amount > 0 else 0
            
            status_data.append({
                'budget_id': budget.id,
                'category': budget.get_category_display(),
                'budget_amount': float(budget.amount),
                'spent': float(total_spent),
                'percentage': round(percentage, 2),
                'remaining': float(budget.amount) - float(total_spent),
                'alert': percentage >= budget.alert_threshold,
            })

        return Response(status_data)
