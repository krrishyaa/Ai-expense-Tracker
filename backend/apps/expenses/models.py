from django.db import models
from django.contrib.auth.models import User

EXPENSE_CATEGORIES = [
    ('food', 'Food & Dining'),
    ('transport', 'Transport'),
    ('entertainment', 'Entertainment'),
    ('utilities', 'Utilities'),
    ('healthcare', 'Healthcare'),
    ('shopping', 'Shopping'),
    ('travel', 'Travel'),
    ('education', 'Education'),
    ('business', 'Business'),
    ('other', 'Other'),
]

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=EXPENSE_CATEGORIES, default='other')
    date = models.DateField()
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    ai_insights = models.TextField(blank=True)
    ai_confidence = models.FloatField(default=0)
    tags = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.description} ({self.amount})"

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-date']),
            models.Index(fields=['user', 'category']),
        ]
