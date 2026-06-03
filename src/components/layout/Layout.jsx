import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AlertBanner from '../../dashboard/AlertBanner'
import { TABS } from './TabBar'

export default function Layout({ children, activeTab, setActiveTab, user, onLogout, bannerAlerts }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={onLogout}
      />
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={onLogout}
        navItems={TABS}
      />
      <div className="lg:ml-[220px] min-h-screen flex flex-col">
        <AlertBanner alerts={bannerAlerts} />
        <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
