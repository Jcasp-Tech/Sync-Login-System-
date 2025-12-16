import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import Header from '@/components/Header'
import DashboardOverview from '@/components/DashboardOverview'
import AnalyticsChart from '@/components/AnalyticsChart'
import UsersTable from '@/components/UsersTable'
import ApiKeyGenerator from '@/components/ApiKeyGenerator'
import SettingsPanel from '@/components/SettingsPanel'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground mb-6">
                Welcome back! Here's what's happening with your account today.
              </p>
            </div>
            <DashboardOverview />
            <AnalyticsChart />
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics</h1>
              <p className="text-muted-foreground mb-6">
                View detailed analytics and insights
              </p>
            </div>
            <AnalyticsChart />
            <DashboardOverview />
          </div>
        )
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Users</h1>
              <p className="text-muted-foreground mb-6">
                Manage user accounts and permissions
              </p>
            </div>
            <UsersTable />
          </div>
        )
      case 'api-keys':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">API Keys</h1>
              <p className="text-muted-foreground mb-6">
                Generate and manage your API access keys
              </p>
            </div>
            <ApiKeyGenerator />
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground mb-6">
                Manage your account settings and preferences
              </p>
            </div>
            <SettingsPanel />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
