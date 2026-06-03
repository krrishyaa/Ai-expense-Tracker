from celery import shared_task
import openai
from django.conf import settings
from django.core.files.base import ContentFile
from django.contrib.auth.models import User
from apps.expenses.models import Expense
from io import BytesIO
import json

# Lazy import WeasyPrint - only needed for PDF generation
try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError):
    WEASYPRINT_AVAILABLE = False

openai.api_key = settings.OPENAI_API_KEY

@shared_task
def categorize_expense_task(expense_id):
    """Categorize expense using OpenAI API"""
    try:
        expense = Expense.objects.get(id=expense_id)
        
        if not settings.OPENAI_API_KEY:
            return
        
        prompt = f"""Analyze this expense: "{expense.description}"
        
        Categories: food, transport, entertainment, utilities, healthcare, shopping, travel, education, business, other
        
        Respond with JSON:
        {{
            "category": "selected_category",
            "confidence": 0.95,
            "insights": "brief insight"
        }}"""
        
        response = openai.ChatCompletion.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        
        result = json.loads(response.choices[0].message.content)
        expense.category = result.get('category', expense.category)
        expense.ai_confidence = result.get('confidence', 0)
        expense.ai_insights = result.get('insights', '')
        expense.save()
        
    except Exception as e:
        print(f"Error categorizing expense {expense_id}: {str(e)}")

@shared_task
def generate_pdf_report_task(user_id):
    """Generate PDF report for user expenses"""
    if not WEASYPRINT_AVAILABLE:
        print(f"WeasyPrint not available - PDF generation skipped for user {user_id}")
        return None
        
    try:
        user = User.objects.get(id=user_id)
        expenses = Expense.objects.filter(user=user).order_by('-date')
        
        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; }}
                    h1 {{ color: #333; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                    th, td {{ border: 1px solid #ddd; padding: 10px; text-align: left; }}
                    th {{ background-color: #f2f2f2; }}
                    .total {{ font-weight: bold; font-size: 14px; }}
                </style>
            </head>
            <body>
                <h1>Expense Report - {user.first_name} {user.last_name}</h1>
                <p>Generated on: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <table>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
        """
        
        total = 0
        for expense in expenses:
            html_content += f"""
                    <tr>
                        <td>{expense.date}</td>
                        <td>{expense.description}</td>
                        <td>{expense.get_category_display()}</td>
                        <td>${expense.amount}</td>
                    </tr>
            """
            total += float(expense.amount)
        
        html_content += f"""
                    <tr class="total">
                        <td colspan="3">Total</td>
                        <td>${total:.2f}</td>
                    </tr>
                </table>
            </body>
        </html>
        """
        
        # Generate PDF
        pdf_file = BytesIO()
        HTML(string=html_content).write_pdf(pdf_file)
        pdf_file.seek(0)
        
        # Save to user's media folder
        filename = f"expense_report_{user.id}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        # In production, save to S3 or storage backend
        
        return filename
        
    except Exception as e:
        print(f"Error generating PDF for user {user_id}: {str(e)}")
