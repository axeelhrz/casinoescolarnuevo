"use client"

import { motion } from 'framer-motion'
import { BookOpen, ShoppingCart, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Ver menú semanal',
    description: 'Revisa las opciones disponibles',
    href: '/panel',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50'
  },
  {
    title: 'Gestionar pedido',
    description: 'Modifica tus selecciones',
    href: '/panel',
    icon: ShoppingCart,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
  },
  {
    title: 'Mis datos',
    description: 'Actualiza tu información',
    href: '/perfil',
    icon: User,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50'
  }
]

export function QuickActionsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="panel-card"
    >
      <div className="panel-card-content">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-clean">
              Acciones Rápidas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-clean">
              Accesos destacados
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={action.href}>
                  <div className={`p-4 rounded-lg border border-slate-200 dark:border-slate-600 transition-all duration-200 cursor-pointer ${action.bgColor}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bgColor}`}>
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${action.color} text-clean`}>
                          {action.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-clean">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${action.color}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
