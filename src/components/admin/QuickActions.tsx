"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpen, 
  ClipboardList, 
  Users, 
  BarChart3,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QuickActionsProps {
  pendingOrdersCount: number
}

export function QuickActions({ pendingOrdersCount }: QuickActionsProps) {
  const quickActions = [
    {
      title: 'Gestionar Menús',
      description: 'Crear y editar menús semanales',
      href: '/admin/menus',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Ver Pedidos',
      description: 'Revisar y gestionar pedidos',
      href: '/admin/pedidos',
      icon: ClipboardList,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      count: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      href: '/admin/usuarios',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Reportes y Estadísticas',
      description: 'Generar reportes y análisis',
      href: '/admin/reportes',
      icon: BarChart3,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    }
  ]

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
          Acciones Rápidas
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Acceso directo a las funciones principales del sistema
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={action.href}>
                <div className={`
                  group relative p-4 rounded-xl border-2 transition-all duration-300
                  hover:shadow-md hover:scale-105 cursor-pointer
                  ${action.bgColor} ${action.borderColor}
                `}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${action.bgColor}`}>
                          <action.icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${action.color} group-hover:underline`}>
                            {action.title}
                          </h3>
                          {action.count && (
                            <Badge 
                              variant="secondary" 
                              className="ml-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            >
                              {action.count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className={`
                      w-4 h-4 ${action.color} opacity-0 group-hover:opacity-100 
                      transform translate-x-1 group-hover:translate-x-0 transition-all duration-300
                    `} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}