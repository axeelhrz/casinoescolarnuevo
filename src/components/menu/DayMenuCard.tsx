"use client"

import { motion } from 'framer-motion'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { DayMenuDisplay } from '@/types/menu'
import { MenuItemCard } from './MenuItemCard'

interface DayMenuCardProps {
  dayMenu: DayMenuDisplay
  userType: 'apoderado' | 'funcionario'
  index: number
}

export function DayMenuCard({ dayMenu, userType, index }: DayMenuCardProps) {
  const isToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return dayMenu.date === today
  }

  const isPastDay = () => {
    const today = new Date().toISOString().split('T')[0]
    return dayMenu.date < today
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm overflow-hidden ${
        isToday()
          ? 'border-blue-300 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30'
          : 'border-slate-200 dark:border-slate-700'
      } ${isPastDay() ? 'opacity-75' : ''}`}
    >
      {/* Encabezado del día */}
      <div className={`p-4 border-b border-slate-200 dark:border-slate-700 ${
        isToday()
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'bg-slate-50 dark:bg-slate-800/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isToday()
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <Calendar size={18} className={
                isToday()
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400'
              } />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-clean">
                {dayMenu.dayLabel}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-clean">
                {dayMenu.dateFormatted}
              </p>
            </div>
          </div>

          {isToday() && (
            <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              <Clock size={14} />
              <span className="text-xs font-medium">Hoy</span>
            </div>
          )}

          {isPastDay() && (
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
              <span className="text-xs font-medium">Pasado</span>
            </div>
          )}
        </div>
      </div>

      {/* Contenido del menú */}
      <div className="p-4">
        {!dayMenu.hasItems ? (
          <div className="text-center py-8">
            <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2 text-clean">
              Menú no disponible
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-clean">
              El menú para este día aún no ha sido publicado por la administración.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Almuerzos */}
            {dayMenu.almuerzos.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 text-clean">
                    Almuerzos
                  </h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    12:00 - 14:00
                  </span>
                </div>
                <div className="grid gap-3">
                  {dayMenu.almuerzos.map((item, itemIndex) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      userType={userType}
                      index={itemIndex}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Colaciones */}
            {dayMenu.colaciones.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🥪</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 text-clean">
                    Colaciones
                  </h3>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                    15:30 - 16:30
                  </span>
                </div>
                <div className="grid gap-3">
                  {dayMenu.colaciones.map((item, itemIndex) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      userType={userType}
                      index={itemIndex}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}