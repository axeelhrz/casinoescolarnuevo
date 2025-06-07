"use client"
import { motion } from 'framer-motion'
import { Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminDayMenu, AdminMenuItem } from '@/types/adminMenu'
import { MenuItemCard } from './MenuItemCard'

interface DayMenuContainerProps {
  dayMenu: AdminDayMenu
  onAddItem: (type: 'almuerzo' | 'colacion') => void
  onEditItem: (item: AdminMenuItem) => void
  onDeleteItem: (item: AdminMenuItem) => void
  isLoading?: boolean
}

export function DayMenuContainer({ 
  dayMenu, 
  onAddItem, 
  onEditItem, 
  onDeleteItem,
  isLoading = false 
}: DayMenuContainerProps) {
  const totalItems = dayMenu.almuerzos.length + dayMenu.colaciones.length
  const activeItems = [...dayMenu.almuerzos, ...dayMenu.colaciones].filter(item => item.active).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                  {dayMenu.dayName}
                </CardTitle>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {dayMenu.date}
                </p>
              </div>
            </div>
            
            {totalItems > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeItems}/{totalItems}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Sección de Almuerzos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
                Almuerzos ({dayMenu.almuerzos.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddItem('almuerzo')}
                disabled={isLoading || !dayMenu.isEditable}
                className="h-6 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar
              </Button>
            </div>
            
            <div className="space-y-1">
              {dayMenu.almuerzos.length > 0 ? (
                dayMenu.almuerzos.map((item, index) => (
                  <MenuItemCard
                    key={item.id || index}
                    item={item}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    isLoading={isLoading}
                  />
                ))
              ) : (
                <div className="p-2 border border-dashed border-blue-200 dark:border-blue-800 rounded text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    Sin almuerzos
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddItem('almuerzo')}
                    disabled={isLoading || !dayMenu.isEditable}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Colaciones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
                Colaciones ({dayMenu.colaciones.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddItem('colacion')}
                disabled={isLoading || !dayMenu.isEditable}
                className="h-6 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar
              </Button>
            </div>
            
            <div className="space-y-1">
              {dayMenu.colaciones.length > 0 ? (
                dayMenu.colaciones.map((item, index) => (
                  <MenuItemCard
                    key={item.id || index}
                    item={item}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    isLoading={isLoading}
                  />
                ))
              ) : (
                <div className="p-2 border border-dashed border-emerald-200 dark:border-emerald-800 rounded text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    Sin colaciones
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddItem('colacion')}
                    disabled={isLoading || !dayMenu.isEditable}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}