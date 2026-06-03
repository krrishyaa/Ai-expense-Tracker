import { format } from 'date-fns'
import { fireRoastNotification } from './roastNotify.jsx'

export { fireRoastNotification }

const CATEGORY_NAMES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Education',
  'Travel',
  'Bills',
  'Other',
]

const KEYWORD_RULES = [
  { keywords: ['food', 'swiggy', 'zomato', 'restaurant', 'lunch', 'dinner', 'cafe'], category: 'Food & Dining' },
  { keywords: ['uber', 'ola', 'petrol', 'fuel', 'taxi', 'metro', 'bus'], category: 'Transportation' },
  { keywords: ['amazon', 'flipkart', 'clothes', 'shopping', 'mall'], category: 'Shopping' },
  { keywords: ['netflix', 'movie', 'spotify', 'game', 'cinema'], category: 'Entertainment' },
  { keywords: ['doctor', 'medicine', 'pharmacy', 'hospital', 'health'], category: 'Healthcare' },
  { keywords: ['electricity', 'wifi', 'internet', 'water', 'gas', 'utility'], category: 'Utilities' },
  { keywords: ['college', 'book', 'course', 'tuition', 'school'], category: 'Education' },
  { keywords: ['flight', 'hotel', 'travel', 'airbnb'], category: 'Travel' },
  { keywords: ['rent', 'emi', 'loan', 'mortgage'], category: 'Bills' },
]

function keywordCategorize(description) {
  const text = (description || '').toLowerCase()
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.category
    }
  }
  return 'Other'
}

export async function categorizeExpense(description) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey?.trim()) {
    return keywordCategorize(description)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You classify expense descriptions into exactly one category name. Valid names: ${CATEGORY_NAMES.join(', ')}. Reply with only the category name, nothing else.`,
          },
          {
            role: 'user',
            content: description || '',
          },
        ],
      }),
    })

    if (!response.ok) {
      return keywordCategorize(description)
    }

    const json = await response.json()
    const raw = json.choices?.[0]?.message?.content?.trim() ?? ''
    const match = CATEGORY_NAMES.find(
      (name) => name.toLowerCase() === raw.toLowerCase(),
    )
    return match ?? keywordCategorize(description)
  } catch {
    return keywordCategorize(description)
  }
}

function extractAmountFromText(text) {
  const t = text || ''
  const patterns = [
    /(?:₹|rs\.?|inr|rupees?)\s*(\d+(?:\.\d{1,2})?)/i,
    /(\d+(?:\.\d{1,2})?)\s*(?:₹|rs\.?|inr|rupees?)/i,
    /\b(\d+(?:\.\d{1,2})?)\b/,
  ]
  for (const pattern of patterns) {
    const match = t.match(pattern)
    if (match) return Number(match[1])
  }
  return null
}

function buildDescriptionFromSpeech(text, amount) {
  let cleaned = (text || '').trim()
  if (amount != null) {
    cleaned = cleaned
      .replace(new RegExp(String(amount).replace('.', '\\.'), 'g'), '')
      .replace(/₹|rs\.?|inr|rupees?/gi, '')
      .replace(/\b(for|on|spent|paid|cost|amount)\b/gi, '')
  }
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  if (cleaned.length >= 3) return cleaned
  return (text || '').trim()
}

export async function parseExpenseFromSpeech(text) {
  const raw = (text || '').trim()
  if (!raw) {
    return { description: '', amount: null, categoryName: 'Other' }
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (apiKey?.trim()) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: `Extract expense fields from spoken text. Reply ONLY valid JSON: {"description":"short title","amount":number or null,"category":"one of ${CATEGORY_NAMES.join(', ')}"}. amount is numeric only.`,
            },
            { role: 'user', content: raw },
          ],
        }),
      })
      if (response.ok) {
        const json = await response.json()
        const content = json.choices?.[0]?.message?.content?.trim() ?? ''
        const parsed = JSON.parse(content.replace(/```json|```/g, '').trim())
        const categoryName =
          CATEGORY_NAMES.find(
            (n) => n.toLowerCase() === String(parsed.category || '').toLowerCase(),
          ) ?? keywordCategorize(raw)
        return {
          description: String(parsed.description || buildDescriptionFromSpeech(raw, parsed.amount)).trim(),
          amount: parsed.amount != null ? Number(parsed.amount) : extractAmountFromText(raw),
          categoryName,
        }
      }
    } catch {
      /* fall through to local parse */
    }
  }

  const amount = extractAmountFromText(raw)
  const categoryName = await categorizeExpense(raw)
  return {
    description: buildDescriptionFromSpeech(raw, amount),
    amount,
    categoryName,
  }
}

function sumAmounts(items) {
  return (items ?? []).reduce((sum, e) => sum + Number(e.amount || 0), 0)
}

function getMonthProgress() {
  const now = new Date()
  const day = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return { day, daysInMonth, ratio: day / daysInMonth }
}

export function generateInsights(expenses, budgets) {
  const list = expenses ?? []
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthExpenses = list.filter((e) => new Date(e.date) >= monthStart)
  const monthTotal = sumAmounts(monthExpenses)

  const { day, daysInMonth, ratio } = getMonthProgress()
  const forecast =
    ratio > 0 ? Math.round((monthTotal / ratio) * 100) / 100 : monthTotal

  const byCategory = {}
  for (const e of monthExpenses) {
    const key = e.category_id || 'unknown'
    byCategory[key] = (byCategory[key] ?? 0) + Number(e.amount)
  }

  let topCategory = 'None'
  let topAmount = 0
  for (const [catId, amount] of Object.entries(byCategory)) {
    if (amount > topAmount) {
      topAmount = amount
      topCategory = catId
    }
  }

  const amounts = list.map((e) => Number(e.amount))
  const avg = amounts.length
    ? amounts.reduce((a, b) => a + b, 0) / amounts.length
    : 0
  const anomalies = list
    .filter((e) => Number(e.amount) > avg * 2 && avg > 0)
    .map((e) => ({
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      date: e.date,
    }))

  const fourWeeksAgo = new Date(now)
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  const recent = list.filter((e) => new Date(e.date) >= fourWeeksAgo)
  const weeklyAverage =
    Math.round((sumAmounts(recent) / 4) * 100) / 100

  const overBudget = (budgets ?? []).filter(
    (b) => b.amount > 0 && (b.spent ?? 0) / b.amount >= 1,
  )
  let savingTip = 'Track daily spending to stay within your monthly goals.'
  if (overBudget.length) {
    savingTip = `You are over budget in ${overBudget.length} categor${overBudget.length === 1 ? 'y' : 'ies'}. Review those expenses first.`
  } else if (anomalies.length) {
    savingTip = 'Review large one-off purchases flagged as anomalies this month.'
  } else if (monthTotal > 0) {
    savingTip = `At your current pace, month-end spend is about ${forecast.toFixed(0)}. Consider setting category limits.`
  }

  return {
    forecast,
    topCategory,
    topCategoryAmount: topAmount,
    anomalies,
    savingTip,
    weeklyAverage,
    monthTotal,
    daysInMonth,
    day,
  }
}

let lastRoast = ''

function hashStr(str, mod) {
  const raw = str.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0)
  return mod > 0 ? Math.abs(raw) % mod : 0
}

function fmtRupee(n) {
  return `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`
}

function getCategoryName(categories, categoryId) {
  return categories?.find((c) => c.id === categoryId)?.name ?? 'Uncategorized'
}

function getBudgetCategoryName(budget, categories) {
  return budget.category_name ?? getCategoryName(categories, budget.category_id)
}

const LOCAL_ROAST_TEMPLATES = [
  (ctx) =>
    `Your ${ctx.categoryName} budget didn't stand a chance. ${fmtRupee(ctx.overspendAmount)} over — that's not a slip, that's a lifestyle.`,
  (ctx) =>
    `You set a ${fmtRupee(ctx.budgetAmount)} limit for ${ctx.categoryName} like it was a suggestion, not a rule. Bold strategy.`,
  (ctx) =>
    `${fmtRupee(ctx.spentAmount)} on ${ctx.categoryName} this month. Your budget is filing for emotional damages.`,
  (ctx) =>
    `The ${fmtRupee(ctx.budgetAmount)} ${ctx.categoryName} budget lasted about as long as your New Year's resolutions.`,
  (ctx) =>
    `${ctx.overpct}% spent on ${ctx.categoryName}. At this rate, your budget spreadsheet is basically fan fiction.`,
  (ctx) =>
    `You blew past your ${ctx.categoryName} budget by ${fmtRupee(ctx.overspendAmount)}. Future you called — they're not happy.`,
  (ctx) =>
    `Your ${ctx.categoryName} spending is a ${fmtRupee(ctx.spentAmount)} argument for why you shouldn't be trusted with money.`,
  (ctx) =>
    `Budgeting for ${ctx.categoryName} at ${fmtRupee(ctx.budgetAmount)} then spending ${fmtRupee(ctx.spentAmount)}. Optimistic. Aggressively optimistic.`,
  (ctx) =>
    `${fmtRupee(ctx.overspendAmount)} over your ${ctx.categoryName} budget. Your wallet has entered its villain era.`,
  (ctx) =>
    `You treated your ${fmtRupee(ctx.budgetAmount)} ${ctx.categoryName} budget like terms and conditions — scrolled past and ignored it.`,
  (ctx) =>
    `${ctx.overpct}% of your ${ctx.categoryName} budget gone. The accountant in your head has resigned.`,
  (ctx) =>
    `Your ${ctx.categoryName} budget said ${fmtRupee(ctx.budgetAmount)}. You heard ${fmtRupee(ctx.spentAmount)}. Interesting interpretation.`,
  (ctx) =>
    `Another month, another ${ctx.categoryName} budget in ruins. At least you're consistent.`,
  (ctx) =>
    `${fmtRupee(ctx.spentAmount)} on ${ctx.categoryName}. Your budget didn't expire — you murdered it.`,
  (ctx) =>
    `You and your ${ctx.categoryName} budget are in a situationship. Technically together, functionally ignored.`,
  (ctx) =>
    `The ${fmtRupee(ctx.budgetAmount)} ${ctx.categoryName} limit was more of a starting point for you, apparently.`,
  (ctx) =>
    `Financial advice from your bank account: please stop. ${ctx.categoryName} spending at ${fmtRupee(ctx.spentAmount)}.`,
  (ctx) =>
    `Your ${ctx.categoryName} budget is having its worst month since you created it.`,
  (ctx) =>
    `${fmtRupee(ctx.overspendAmount)} over on ${ctx.categoryName}. Not a red flag — a red parade.`,
  (ctx) =>
    `You set a ${ctx.categoryName} budget to feel responsible, then spent ${fmtRupee(ctx.spentAmount)} to feel alive.`,
  (ctx) =>
    `Your banking app just sent a notification that only says "why" about ${ctx.categoryName}.`,
  (ctx) =>
    `${fmtRupee(ctx.overspendAmount)} past ${ctx.categoryName} budget. Mathematically impressive. Financially concerning.`,
  (ctx) =>
    `You didn't break your ${ctx.categoryName} budget — you renegotiated it without permission.`,
  (ctx) =>
    `${ctx.categoryName} at ${fmtRupee(ctx.spentAmount)}: your budget was the wish, this was the grant.`,
  (ctx) =>
    `If ${ctx.categoryName} spending were a sport, you'd be going pro at ${fmtRupee(ctx.spentAmount)}.`,
  (ctx) =>
    `Your ${fmtRupee(ctx.budgetAmount)} ${ctx.categoryName} cap had the structural integrity of a wet napkin.`,
  (ctx) =>
    `Somewhere, your future vacation fund felt a disturbance. ${ctx.categoryName}: ${fmtRupee(ctx.overspendAmount)} over.`,
  (ctx) =>
    `You spent ${ctx.overpct}% of your ${ctx.categoryName} budget like rent was optional.`,
  (ctx) =>
    `Budget meeting for ${ctx.categoryName}: agenda item one — what happened to ${fmtRupee(ctx.budgetAmount)}.`,
  (ctx) =>
    `Congratulations on turning ${ctx.categoryName} from a budget category into a personality trait.`,
  (ctx) =>
    `${ctx.categoryName} overspend at ${fmtRupee(ctx.overspendAmount)}: your budget had dreams. You had other plans.`,
]

function pickLocalRoast(ctx, avoidText) {
  const month = format(new Date(), 'yyyy-MM')
  const key = ctx.categoryName + month + Math.floor(ctx.spentAmount / 100)
  let idx = hashStr(key, LOCAL_ROAST_TEMPLATES.length)
  for (let i = 0; i < LOCAL_ROAST_TEMPLATES.length; i += 1) {
    const roast = LOCAL_ROAST_TEMPLATES[idx](ctx)
    if (roast !== avoidText) return roast
    idx = (idx + 1) % LOCAL_ROAST_TEMPLATES.length
  }
  return LOCAL_ROAST_TEMPLATES[idx](ctx)
}

function buildTopPurchases(categoryExpenses) {
  return [...categoryExpenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 3)
    .map((e) => `₹${Math.round(Number(e.amount))} on ${e.description || 'expense'}`)
    .join(', ')
}

export async function generateRoast(
  categoryName,
  budgetAmount,
  spentAmount,
  overspendAmount,
  allExpenses,
  categoryId,
) {
  const overpct = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 100
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const categoryExpenses = (allExpenses ?? []).filter((e) => {
    const d = new Date(e.date)
    if (d < monthStart) return false
    if (categoryId) return e.category_id === categoryId
    return true
  })
  const topPurchases = buildTopPurchases(categoryExpenses)

  const ctx = {
    categoryName,
    budgetAmount,
    spentAmount,
    overspendAmount,
    overpct,
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (apiKey?.trim()) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.9,
          messages: [
            {
              role: 'system',
              content: `You are a brutally honest, sarcastic financial roast comedian. The user has gone over budget. 
Roast them in exactly 1-2 sentences. Be specific about what they bought. Be funny, sharp, 
and slightly savage — like a best friend who has seen their bank statements. 
Never use emojis. Never be actually mean or hurtful. Never repeat generic phrases like 
"looks like someone..." or "seems like you...". Start each roast differently. 
Vary your openers: use shock, math jokes, comparisons, hypotheticals, callback humor.`,
            },
            {
              role: 'user',
              content: `Category: ${categoryName}. Budget: ₹${budgetAmount}. Spent: ₹${spentAmount} (${overpct}% of budget, ₹${overspendAmount} over). Top purchases this month: ${topPurchases || 'none listed'}. Write a roast.`,
            },
          ],
        }),
      })
      if (response.ok) {
        const json = await response.json()
        let roast = json.choices?.[0]?.message?.content?.trim() ?? ''
        if (roast && roast === lastRoast) {
          const retry = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              temperature: 1,
              messages: [
                {
                  role: 'system',
                  content:
                    'Write a different 1-2 sentence budget overspend roast. Never use emojis. Start with a completely different opener than before.',
                },
                {
                  role: 'user',
                  content: `Category: ${categoryName}. Top purchases: ${topPurchases}. Previous roast to avoid repeating: ${roast}`,
                },
              ],
            }),
          })
          if (retry.ok) {
            const retryJson = await retry.json()
            roast = retryJson.choices?.[0]?.message?.content?.trim() || roast
          }
        }
        if (roast) {
          lastRoast = roast
          return roast
        }
      }
    } catch {
      /* fall through */
    }
  }

  const roast = pickLocalRoast(ctx, lastRoast)
  lastRoast = roast
  return roast
}

export function filterByPeriod(expenses, period) {
  const now = new Date()
  return (expenses ?? []).filter((e) => {
    const d = new Date(e.date)
    if (period === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    if (period === 'last_month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
    }
    if (period === 'this_year') return d.getFullYear() === now.getFullYear()
    return true
  })
}

const PERIOD_LABELS = {
  this_month: 'this month',
  last_month: 'last month',
  this_year: 'this year',
  all_time: 'all time',
}

export function detectIntent(msg) {
  const m = (msg || '').toLowerCase()
  if (m.match(/how much.*(spend|spent)|total spend|spending total/)) return 'total_spend'
  if (m.match(/biggest|largest|most expensive|highest/)) return 'biggest_expense'
  if (m.match(/budget status|over budget|overspend|budget check|how.*budget|how bad/))
    return 'budget_status'
  if (m.match(/daily average|per day|average spend/)) return 'daily_average'
  if (m.match(/breakdown|all categories|category split/)) return 'category_breakdown'
  if (m.match(/top category|most.*category|where.*spend/)) return 'top_category'
  if (m.match(/trend|compared|last month|this month vs/)) return 'spend_trend'
  if (m.match(/save|saving|cut down|reduce/)) return 'savings_potential'
  if (m.match(/recurring|subscriptions|regular/)) return 'recurring_cost'
  if (m.match(/unusual|anomal|weird|strange/)) return 'anomaly_summary'
  if (m.match(/forecast|predict|end of month|project/)) return 'forecast'
  if (m.match(/week|weekly/)) return 'weekly_comparison'
  return 'total_spend'
}

export function detectPeriod(msg) {
  const m = (msg || '').toLowerCase()
  if (m.match(/last month/)) return 'last_month'
  if (m.match(/this year|year/)) return 'this_year'
  if (m.match(/all time|ever|total/)) return 'all_time'
  return 'this_month'
}

function needsContext(message) {
  return /\bthat\b|\bit\b|more detail|tell me more|elaborate|and what about/i.test(
    message || '',
  )
}

function daysInPeriod(period) {
  const now = new Date()
  if (period === 'this_month') return Math.max(1, now.getDate())
  if (period === 'last_month') {
    const lm = new Date(now.getFullYear(), now.getMonth(), 0)
    return lm.getDate()
  }
  if (period === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1)
    return Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)))
  }
  return 1
}

function daysSpanForExpenses(filtered, period) {
  if (period === 'all_time' && filtered.length) {
    const dates = filtered.map((e) => new Date(e.date).getTime())
    const span = Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, span)
  }
  return daysInPeriod(period)
}

const INTENT_HANDLERS = {
  total_spend: ({ expenses, period }) => {
    const filtered = filterByPeriod(expenses, period)
    const total = sumAmounts(filtered)
    const label = PERIOD_LABELS[period]
    return {
      text: `You spent ${fmtRupee(total)} across ${filtered.length} transaction${filtered.length === 1 ? '' : 's'} in ${label}.`,
      expenseCount: filtered.length,
    }
  },

  top_category: ({ expenses, period, categories }) => {
    const filtered = filterByPeriod(expenses, period)
    const total = sumAmounts(filtered)
    if (!filtered.length) {
      return { text: `No spending recorded for ${PERIOD_LABELS[period]}.`, expenseCount: 0 }
    }
    const byCat = {}
    for (const e of filtered) {
      const id = e.category_id || 'none'
      byCat[id] = (byCat[id] ?? 0) + Number(e.amount)
    }
    let maxId = null
    let maxAmt = 0
    for (const [id, amt] of Object.entries(byCat)) {
      if (amt > maxAmt) {
        maxAmt = amt
        maxId = id
      }
    }
    const name = getCategoryName(categories, maxId)
    const pct = total > 0 ? Math.round((maxAmt / total) * 100) : 0
    return {
      text: `Your biggest spending category is ${name} at ${fmtRupee(maxAmt)} (${pct}% of total spend).`,
      expenseCount: filtered.length,
    }
  },

  budget_status: ({ expenses, budgets, categories }) => {
    const list = budgets ?? []
    if (!list.length) {
      return { text: 'You have no budgets set up yet.', expenseCount: 0 }
    }
    const monthExpenses = filterByPeriod(expenses, 'this_month')
    const lines = [...list]
      .map((b) => {
        const spent = Number(b.spent ?? 0)
        const amount = Number(b.amount)
        const pct = amount > 0 ? Math.round((spent / amount) * 100) : 0
        let status = 'on track'
        if (pct >= 100) status = 'over budget'
        else if (pct >= 80) status = 'at risk'
        const name = getBudgetCategoryName(b, categories)
        return `${name}: ${fmtRupee(spent)} / ${fmtRupee(amount)} (${pct}%) — ${status}`
      })
      .sort((a, b) => {
        const pctA = parseInt(a.match(/\((\d+)%\)/)?.[1] ?? '0', 10)
        const pctB = parseInt(b.match(/\((\d+)%\)/)?.[1] ?? '0', 10)
        return pctB - pctA
      })
    return {
      text: `Budget status:\n${lines.join('\n')}`,
      expenseCount: monthExpenses.length,
    }
  },

  daily_average: ({ expenses, period }) => {
    const filtered = filterByPeriod(expenses, period)
    const total = sumAmounts(filtered)
    const days = daysSpanForExpenses(filtered, period)
    const avg = Math.round((total / days) * 100) / 100
    return {
      text: `Your daily average spend ${PERIOD_LABELS[period]} is ${fmtRupee(avg)}.`,
      expenseCount: filtered.length,
    }
  },

  biggest_expense: ({ expenses, period }) => {
    const filtered = filterByPeriod(expenses, period)
    if (!filtered.length) {
      return { text: `No expenses recorded for ${PERIOD_LABELS[period]}.`, expenseCount: 0 }
    }
    const biggest = [...filtered].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
    return {
      text: `Your biggest single expense ${PERIOD_LABELS[period]} was ${fmtRupee(biggest.amount)} on ${biggest.description} (${biggest.date}).`,
      expenseCount: filtered.length,
    }
  },

  spend_trend: ({ expenses }) => {
    const thisMonth = filterByPeriod(expenses, 'this_month')
    const lastMonth = filterByPeriod(expenses, 'last_month')
    const thisTotal = sumAmounts(thisMonth)
    const lastTotal = sumAmounts(lastMonth)
    if (lastTotal === 0) {
      return {
        text: `You spent ${fmtRupee(thisTotal)} this month. No spending recorded last month to compare.`,
        expenseCount: thisMonth.length + lastMonth.length,
      }
    }
    const diffPct = Math.round((Math.abs(thisTotal - lastTotal) / lastTotal) * 100)
    const direction = thisTotal >= lastTotal ? 'more' : 'less'
    return {
      text: `You spent ${fmtRupee(thisTotal)} this month vs ${fmtRupee(lastTotal)} last month — that's ${diffPct}% ${direction}.`,
      expenseCount: thisMonth.length + lastMonth.length,
    }
  },

  savings_potential: ({ expenses, budgets, categories }) => {
    const list = budgets ?? []
    const tight = list.filter((b) => {
      const amount = Number(b.amount)
      const spent = Number(b.spent ?? 0)
      return amount > 0 && spent / amount >= 0.8
    })
    if (!tight.length) {
      return {
        text: 'No categories are consistently near or over budget. Keep tracking to spot savings opportunities.',
        expenseCount: filterByPeriod(expenses, 'this_month').length,
      }
    }
    const target = tight.sort(
      (a, b) => b.spent / b.amount - a.spent / a.amount,
    )[0]
    const name = getBudgetCategoryName(target, categories)
    const savings = Math.round(Number(target.spent) * 0.15)
    return {
      text: `If you cut ${name} by 15%, you'd save ${fmtRupee(savings)}/month.`,
      expenseCount: filterByPeriod(expenses, 'this_month').length,
    }
  },

  recurring_cost: ({ expenses }) => {
    const recurring = (expenses ?? []).filter((e) => e.is_recurring)
    const total = sumAmounts(recurring)
    return {
      text: `Your recurring expenses total ${fmtRupee(total)}/month across ${recurring.length} item${recurring.length === 1 ? '' : 's'}.`,
      expenseCount: recurring.length,
    }
  },

  anomaly_summary: ({ expenses }) => {
    const filtered = filterByPeriod(expenses, 'this_month')
    const amounts = filtered.map((e) => Number(e.amount))
    const avg = amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0
    const unusual = filtered.filter((e) => Number(e.amount) > avg * 2 && avg > 0)
    if (!unusual.length) {
      return { text: 'No unusual expenses this month.', expenseCount: filtered.length }
    }
    const list = unusual
      .slice(0, 5)
      .map((e) => `${fmtRupee(e.amount)} on ${e.description}`)
      .join('; ')
    return {
      text: `Found ${unusual.length} unusual expense${unusual.length === 1 ? '' : 's'}: ${list}.`,
      expenseCount: filtered.length,
    }
  },

  forecast: ({ expenses }) => {
    const thisMonth = filterByPeriod(expenses, 'this_month')
    const total = sumAmounts(thisMonth)
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const daysGone = Math.max(1, today.getDate())
    const dailyAvg = total / daysGone
    const daysLeft = daysInMonth - daysGone
    const projected = Math.round(dailyAvg * daysInMonth)
    const paceRemaining = Math.round(dailyAvg * daysLeft)
    return {
      text: `At your current pace, you'll spend ${fmtRupee(paceRemaining)} more this month (${fmtRupee(projected)} projected total).`,
      expenseCount: thisMonth.length,
    }
  },

  category_breakdown: ({ expenses, period, categories }) => {
    const filtered = filterByPeriod(expenses, period)
    const total = sumAmounts(filtered)
    if (!filtered.length) {
      return { text: `No expenses for ${PERIOD_LABELS[period]}.`, expenseCount: 0 }
    }
    const byCat = {}
    const counts = {}
    for (const e of filtered) {
      const id = e.category_id || 'none'
      byCat[id] = (byCat[id] ?? 0) + Number(e.amount)
      counts[id] = (counts[id] ?? 0) + 1
    }
    const lines = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([id, amt]) => {
        const name = getCategoryName(categories, id)
        const pct = total > 0 ? Math.round((amt / total) * 100) : 0
        return `${name}: ${fmtRupee(amt)} (${pct}%) — ${counts[id]} txns`
      })
    return {
      text: `Category breakdown (${PERIOD_LABELS[period]}):\n${lines.join('\n')}`,
      expenseCount: filtered.length,
    }
  },

  weekly_comparison: ({ expenses }) => {
    const now = new Date()
    const weeks = [0, 1, 2, 3].map((w) => {
      const end = new Date(now)
      end.setDate(end.getDate() - w * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      const total = (expenses ?? [])
        .filter((e) => {
          const d = new Date(e.date)
          return d >= start && d <= end
        })
        .reduce((s, e) => s + Number(e.amount), 0)
      return Math.round(total)
    })
    const [w1, w2, w3, w4] = weeks.reverse()
    let trend = 'Spending held steady week to week.'
    if (w4 > w3 * 1.1) trend = 'Spending picked up in the most recent week.'
    else if (w4 < w3 * 0.9) trend = 'You eased spending in the latest week — nice.'
    return {
      text: `Week 1: ${fmtRupee(w1)}, Week 2: ${fmtRupee(w2)}, Week 3: ${fmtRupee(w3)}, Week 4: ${fmtRupee(w4)}. ${trend}`,
      expenseCount: (expenses ?? []).length,
    }
  },
}

export function chatResponse(message, expenses, budgets, categories, options = {}) {
  const { previousResponse, previousIntent } = options
  const list = expenses ?? []
  const budgetList = budgets ?? []
  const catList = categories ?? []

  const intent =
    needsContext(message) && previousIntent
      ? previousIntent
      : detectIntent(message)
  const period = detectPeriod(message)

  const handler = INTENT_HANDLERS[intent] ?? INTENT_HANDLERS.total_spend
  const result = handler({
    expenses: list,
    budgets: budgetList,
    categories: catList,
    period,
    message,
    previousResponse,
  })

  return { ...result, intent }
}
