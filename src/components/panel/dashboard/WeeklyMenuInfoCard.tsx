"use client"

import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeeklyMenuInfo } from '@/types/dashboard'
import { getWeekDateRange } from '@/lib/dashboardUtils'
import Link from 'next/link'

interface WeeklyMenuInfoCardProps {
  weeklyMenuInfo: WeeklyMenuInfo
}

export function WeeklyMenuInfoCard({ weeklyMenuInfo }: WeeklyMenuInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="panel-card"
    >
      <div className="panel-card-content">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-clean">
              Menú Semanal
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-clean">
              Disponibilidad
            </p>
          </div>
        </div>

        {weeklyMenuInfo.isPublished ? (
          <div className="space-y-4">
            {/* Estado publicado */}
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-300 text-clean">
                  Menú disponible
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-clean">
                  {weeklyMenuInfo.weekStart && weeklyMenuInfo.weekEnd && 
                    getWeekDateRange(weeklyMenuInfo.weekStart, weeklyMenuInfo.weekEnd)
                  }
                </p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 text-clean">
                El menú de esta semana ya está disponible. Puedes revisar todas las opciones y hacer tus selecciones.
              </p>
            </div>

            {/* Información de actualización */}
            {weeklyMenuInfo.lastUpdated && (
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-clean">
                  Última actualización: {weeklyMenuInfo.lastUpdated.toLocaleDateString('es-CL')}
                </span>
              </div>
            )}

            {/* Botón de acción */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/panel" className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <span>Ver menú semanal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estado no publicado */}
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-300 text-clean">
                  Menú aún no disponible
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-clean">
                  Se publicará próximamente
                </p>
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 text-clean">
                El menú de esta semana aún no ha sido publicado por la administración. Te notificaremos cuando esté disponible.
              </p>
            </div>

            {/* Botón deshabilitado */}
            <Button disabled className="w-full bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed">
              <span>Menú no disponible</span>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}