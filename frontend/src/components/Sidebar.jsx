import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar({ activeSection, onSectionChange }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'api-keys', label: 'API Keys', icon: '🔑' },
    { id: 'authentication', label: 'Authentication', icon: '🔐' },
    { id: 'endpoints', label: 'Endpoints', icon: '🌐' },
    { id: 'examples', label: 'Examples', icon: '💡' },
  ]

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold">API Docs</h1>
        <p className="text-sm text-muted-foreground mt-1">Documentation</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Button onClick={handleLogout} variant="outline" className="w-full">
          Logout
        </Button>
      </div>
    </div>
  )
}

