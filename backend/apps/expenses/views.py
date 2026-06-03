from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils.dateparse import parse_date
from .models import Expense
from .serializers import ExpenseSerializer, ExpenseCreateUpdateSerializer
from apps.tasks.tasks import categorize_expense_task, generate_pdf_report_task

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'date']
    search_fields = ['description', 'tags']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExpenseCreateUpdateSerializer
        return ExpenseSerializer

    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        categorize_expense_task.delay(expense.id)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        expenses_data = request.data.get('expenses', [])
        created_expenses = []
        for data in expenses_data:
            serializer = ExpenseCreateUpdateSerializer(data=data)
            if serializer.is_valid():
                expense = serializer.save(user=request.user)
                categorize_expense_task.delay(expense.id)
                created_expenses.append(ExpenseSerializer(expense).data)
        return Response({'created': created_expenses}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.get_queryset()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=parse_date(start_date))
        if end_date:
            queryset = queryset.filter(date__lte=parse_date(end_date))

        total = sum(e.amount for e in queryset)
        by_category = {}
        for expense in queryset:
            if expense.category not in by_category:
                by_category[expense.category] = 0
            by_category[expense.category] += float(expense.amount)

        return Response({
            'total': total,
            'count': queryset.count(),
            'by_category': by_category
        })

    @action(detail=False, methods=['post'])
    def export_pdf(self, request):
        task = generate_pdf_report_task.delay(request.user.id)
        return Response({'task_id': task.id}, status=status.HTTP_202_ACCEPTED)
