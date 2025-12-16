import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Bell, Settings, LogOut, User, Menu } from 'lucide-react'

export default function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative h-10 w-10 rounded-full p-0 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0 bg-transparent cursor-pointer"
              >
                <Avatar className="h-10 w-10 pointer-events-none">
                  <AvatarFallback className="pointer-events-none">
                    {user ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar>
                  <AvatarFallback>
                    {user ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-sm font-medium leading-none">
                    {user?.full_name || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground leading-none">
                    {user?.email_address || 'No email'}
                  </span>
                  {user?.position_title && (
                    <span className="text-xs text-muted-foreground leading-none mt-0.5">
                      {user.position_title}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

