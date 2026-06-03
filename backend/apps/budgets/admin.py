from django.contrib import admin
from .models import Budget

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'amount', 'period', 'is_active')
    list_filter = ('period', 'is_active', 'user')
    search_fields = ('user__username', 'category')
