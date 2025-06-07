"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  MenuSquare, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: number
}

export function AdminNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Panel principal'
    },
    {
      name: 'Usuarios',
      href: '/admin/usuarios',
      icon: Users,
      description: 'Gestión de usuarios'
    },
    {
      name: 'Pedidos',
      href: '/admin/pedidos',
      icon: ShoppingCart,
      description: 'Gestión de pedidos'
    },
    {
      name: 'Menús',
      href: '/admin/menus',
      icon: MenuSquare,
      description: 'Gestión de menús'
    },
    {
      name: 'Reportes',
      href: '/admin/reportes',
      icon: BarChart3,
      description: 'Centro de reportes'
    }
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={toggleMobileMenu}
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm border-slate-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Navigation sidebar - Mobile */}
      <motion.nav
        initial={{ x: -280 }}
        animate={{ x: isMobileMenuOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed left-0 top-0 h-full w-70 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Admin Panel
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Casino Escolar
                </p>
              </div>
            </div>
          </div>

          {/* Navigation items */}
          <div className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <Link
                href="/admin/settings"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configuración</span>
              </Link>
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Desktop navigation - Fijo en la izquierda */}
      <nav className="hidden lg:block fixed left-0 top-0 h-full w-70 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-30">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Admin Panel
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Casino Escolar
                </p>
              </div>
            </div>
          </div>

          {/* Navigation items */}
          <div className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <Link
                href="/admin/settings"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configuración</span>
              </Link>
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}