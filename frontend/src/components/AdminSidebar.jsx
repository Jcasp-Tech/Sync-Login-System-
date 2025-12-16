import { useNavigate } from 'react-router-dom'
import { Home, LayoutDashboard, BarChart3, Users, FileText, Settings, Key, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminSidebar({ activeSection, onSectionChange, isOpen = true, onClose }) {
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div
      className={`
        w-64 bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="p-4 md:p-6 border-b border-border h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6" />
          <h1 className="text-xl font-bold">Sync Inc.</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSectionChange(item.id)
                    // Close sidebar on mobile after selection
                    if (onClose) {
                      onClose()
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

