import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function escapeCsv(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function getCategoryLabel(expense) {
  return expense.category ?? expense.categoryName ?? expense.category_id ?? 'Unknown'
}

export function exportCSV(expenses) {
  const headers = ['Date', 'Description', 'Category', 'Amount']
  const rows = (expenses ?? []).map((e) => [
    e.date ?? '',
    e.description ?? '',
    getCategoryLabel(e),
    Number(e.amount ?? 0).toFixed(2),
  ])

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'expenses.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function exportPDF(expenses, summary) {
  const doc = new jsPDF()
  const generated = new Date().toLocaleDateString()

  doc.setFontSize(18)
  doc.text('Expense Report', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated: ${generated}`, 14, 28)

  doc.setTextColor(0)
  doc.setFontSize(11)
  const total = summary?.total ?? 0
  const count = summary?.count ?? (expenses?.length ?? 0)
  doc.text(`Total: ${Number(total).toFixed(2)}`, 14, 38)
  doc.text(`Transaction count: ${count}`, 14, 45)

  if (summary?.dailyAverage != null) {
    doc.text(`Daily average: ${Number(summary.dailyAverage).toFixed(2)}`, 14, 52)
  }
  if (summary?.topCategory) {
    doc.text(`Top category: ${summary.topCategory}`, 14, 59)
  }

  const tableStartY = summary?.topCategory ? 66 : summary?.dailyAverage != null ? 59 : 52

  autoTable(doc, {
    startY: tableStartY,
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: (expenses ?? []).map((e) => [
      e.date ?? '',
      e.description ?? '',
      getCategoryLabel(e),
      Number(e.amount ?? 0).toFixed(2),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [108, 99, 255] },
  })

  doc.save('expenses.pdf')
}
