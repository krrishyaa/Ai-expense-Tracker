import { useNavigate } from 'react-router-dom'
import { DashboardProvider, useDashboard } from '../context/DashboardContext'
import Layout from '../components/layout/Layout'
import ExpenseList from '../dashboard/ExpenseList'
import BudgetList from '../dashboard/BudgetList'
import CategoryManager from '../dashboard/CategoryManager'
import Analytics from '../dashboard/Analytics'
import Insights from '../dashboard/Insights'
import Reports from '../dashboard/Reports'

function DashboardContent() {
  const navigate = useNavigate()
  const { activeTab, setActiveTab, user, logout, bannerAlerts } = useDashboard()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const tabPanel = {
    expenses: <ExpenseList />,
    budgets: <BudgetList />,
    categories: <CategoryManager />,
    analytics: <Analytics />,
    insights: <Insights />,
    reports: <Reports />,
  }[activeTab]

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={handleLogout}
      bannerAlerts={bannerAlerts}
    >
      {tabPanel}
    </Layout>
  )
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
