import { useMemo, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { format, subMonths, startOfMonth, eachDayOfInterval, subDays } from 'date-fns'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useDashboard } from '../context/DashboardContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { formatCurrency } from '../lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart
    if (!chartArea) return
    const total = chart.config.options.plugins.centerText?.total ?? 0
    ctx.save()
    ctx.font = '600 20px "Space Grotesk", sans-serif'
    ctx.fillStyle = '#eef0f6'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      formatCurrency(total),
      (chartArea.left + chartArea.right) / 2,
      (chartArea.top + chartArea.bottom) / 2,
    )
    ctx.restore()
  },
}

ChartJS.register(centerTextPlugin)

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'rgba(238,240,246,0.45)', font: { family: 'Inter', size: 12 } } },
    tooltip: {
      backgroundColor: '#1c1e28',
      borderColor: 'rgba(255,255,255,0.09)',
      borderWidth: 1,
      titleColor: '#eef0f6',
      bodyColor: 'rgba(238,240,246,0.55)',
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(238,240,246,0.4)' } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(238,240,246,0.4)' } },
  },
}

function computeData(expenses, categories) {
  const list = expenses ?? []
  const now = new Date()
  const monthStart = startOfMonth(now)

  const monthlyKeys = []
  for (let i = 5; i >= 0; i--) {
    monthlyKeys.push(format(subMonths(now, i), 'MMM yyyy'))
  }
  const monthlyMap = Object.fromEntries(monthlyKeys.map((k) => [k, 0]))
  list.forEach((e) => {
    const key = format(new Date(e.date + 'T00:00:00'), 'MMM yyyy')
    if (monthlyMap[key] != null) monthlyMap[key] += Number(e.amount)
  })

  const catMap = {}
  list
    .filter((e) => new Date(e.date + 'T00:00:00') >= monthStart)
    .forEach((e) => {
      catMap[e.category_id] = (catMap[e.category_id] ?? 0) + Number(e.amount)
    })

  const catLabels = []
  const catValues = []
  const catColors = []
  Object.entries(catMap).forEach(([id, val]) => {
    const cat = categories.find((c) => c.id === id)
    catLabels.push(cat?.name ?? 'Unknown')
    catValues.push(val)
    catColors.push(cat?.color ?? '#6b7280')
  })

  const days = eachDayOfInterval({ start: subDays(now, 29), end: now })
  const dailyMap = Object.fromEntries(
    days.map((d) => [format(d, 'yyyy-MM-dd'), 0]),
  )
  list.forEach((e) => {
    if (dailyMap[e.date] != null) dailyMap[e.date] += Number(e.amount)
  })

  return {
    monthly: { labels: monthlyKeys, values: monthlyKeys.map((k) => monthlyMap[k]) },
    category: { labels: catLabels, values: catValues, colors: catColors, total: catValues.reduce((a, b) => a + b, 0) },
    daily: {
      labels: days.map((d) => format(d, 'MMM d')),
      values: days.map((d) => dailyMap[format(d, 'yyyy-MM-dd')]),
    },
  }
}

function ChartShell({ title, children, className = '' }) {
  return (
    <div
      className={`rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">{title}</h3>
      <div className="h-[280px]">{children}</div>
    </div>
  )
}

export default function Analytics() {
  const { expenses, categories } = useDashboard()
  const data = useMemo(() => computeData(expenses, categories), [expenses, categories])
  const barRef = useRef(null)
  const barChartRef = useRef(null)
  const revealRef = useScrollReveal({ y: 24, stagger: 0.08 })

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const chart = barChartRef.current
      if (!chart || !barRef.current) return
      const targets = [...data.monthly.values]
      const proxy = { vals: targets.map(() => 0) }
      gsap.to(proxy, {
        vals: targets,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: barRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (!chart.data?.datasets?.[0]) return
          chart.data.datasets[0].data = [...proxy.vals]
          chart.update('none')
        },
      })
    },
    { scope: barRef, dependencies: [data.monthly.values] },
  )

  if (!expenses.length) {
    return (
      <p className="text-center py-12 text-[var(--text-muted)] text-sm">
        Add expenses to view analytics.
      </p>
    )
  }

  const barData = {
    labels: data.monthly.labels,
    datasets: [
      {
        data: data.monthly.values,
        backgroundColor: '#4f8ef7',
        hoverBackgroundColor: '#6aa1f8',
        borderRadius: 6,
      },
    ],
  }

  const doughnutData = {
    labels: data.category.labels,
    datasets: [{ data: data.category.values, backgroundColor: data.category.colors, borderWidth: 0 }],
  }

  const lineData = {
    labels: data.daily.labels,
    datasets: [
      {
        data: data.daily.values,
        borderColor: '#4f8ef7',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        backgroundColor: (ctx) => {
          const { chart } = ctx
          const { ctx: c, chartArea } = chart
          if (!chartArea) return 'transparent'
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          g.addColorStop(0, 'rgba(79,142,247,0.2)')
          g.addColorStop(1, 'rgba(79,142,247,0)')
          return g
        },
      },
    ],
  }

  return (
    <div ref={revealRef} className="space-y-6">
      <div ref={barRef}>
        <ChartShell title="Monthly spending (last 6 months)">
          <Bar
            ref={barChartRef}
            data={barData}
            options={{
              ...chartDefaults,
              plugins: { ...chartDefaults.plugins, legend: { display: false } },
            }}
          />
        </ChartShell>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartShell title="Category breakdown" className="lg:col-span-2">
          <Doughnut
            data={doughnutData}
            options={{
              ...chartDefaults,
              plugins: {
                ...chartDefaults.plugins,
                legend: { position: 'right', labels: { color: 'rgba(238,240,246,0.45)', boxWidth: 12 } },
                centerText: { total: data.category.total },
              },
              scales: {},
            }}
          />
        </ChartShell>
        <ChartShell title="Daily spending (30 days)" className="lg:col-span-3">
          <Line data={lineData} options={chartDefaults} />
        </ChartShell>
      </div>
    </div>
  )
}
