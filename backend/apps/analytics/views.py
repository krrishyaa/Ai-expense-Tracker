from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, datetime
from collections import defaultdict
from apps.expenses.models import Expense
from .serializers import AnalyticsSerializer

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def monthly_trends(self, request):
        months = int(request.query_params.get('months', 12))
        today = timezone.now().date()
        start_date = today - timedelta(days=30 * months)

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_date
        ).order_by('date')

        monthly_data = defaultdict(float)
        for expense in expenses:
            month_key = expense.date.strftime('%Y-%m')
            monthly_data[month_key] += float(expense.amount)

        labels = sorted(monthly_data.keys())
        data = [monthly_data[label] for label in labels]

        return Response({
            'labels': labels,
            'data': data,
            'type': 'monthly'
        })

    @action(detail=False, methods=['get'])
    def category_breakdown(self, request):
        months = int(request.query_params.get('months', 1))
        today = timezone.now().date()
        start_date = today - timedelta(days=30 * months)

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_date
        )

        category_data = defaultdict(float)
        for expense in expenses:
            category_data[expense.get_category_display()] += float(expense.amount)

        return Response({
            'labels': list(category_data.keys()),
            'data': list(category_data.values()),
            'type': 'category'
        })

    @action(detail=False, methods=['get'])
    def forecast(self, request):
        months = int(request.query_params.get('months', 12))
        today = timezone.now().date()
        start_date = today - timedelta(days=30 * months)

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_date
        ).order_by('date')

        monthly_totals = []
        for expense in expenses:
            month_key = expense.date.strftime('%Y-%m')
            if not monthly_totals or monthly_totals[-1][0] != month_key:
                monthly_totals.append([month_key, 0])
            monthly_totals[-1][1] += float(expense.amount)

        if len(monthly_totals) < 2:
            return Response({'message': 'Insufficient data for forecast'})

        # Simple linear forecasting
        avg = sum(m[1] for m in monthly_totals) / len(monthly_totals)
        forecast_data = []
        last_date = datetime.strptime(monthly_totals[-1][0], '%Y-%m').date()

        for i in range(1, 4):
            forecast_date = last_date + timedelta(days=30 * i)
            forecast_data.append({
                'date': forecast_date.strftime('%Y-%m'),
                'forecast': round(avg, 2),
                'confidence': 0.75
            })

        return Response({
            'actual': monthly_totals,
            'forecast': forecast_data,
            'average_monthly': round(avg, 2)
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        today = timezone.now().date()
        expenses = Expense.objects.filter(user=request.user)

        total_all_time = sum(e.amount for e in expenses)
        
        # Monthly
        month_start = today.replace(day=1)
        monthly = sum(e.amount for e in expenses.filter(date__gte=month_start))
        
        # Today
        today_expenses = sum(e.amount for e in expenses.filter(date=today))
        
        # Week
        week_start = today - timedelta(days=today.weekday())
        weekly = sum(e.amount for e in expenses.filter(date__gte=week_start))

        return Response({
            'total_all_time': float(total_all_time),
            'monthly_total': float(monthly),
            'weekly_total': float(weekly),
            'today_total': float(today_expenses),
            'expense_count': expenses.count(),
        })
