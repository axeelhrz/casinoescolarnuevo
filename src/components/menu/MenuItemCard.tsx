"use client"

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { MenuItem } from '@/types/menu'

interface MenuItemCardProps {
  item: MenuItem
  userType: 'apoderado' | 'funcionario'
  index: number
}

export function MenuItemCard({ item, userType, index }: MenuItemCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-lg border transition-all duration-200 ${
        item.available
          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs font-mono px-2 py-1 rounded ${
              item.type === 'almuerzo'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            }`}>
              {item.code}
            </span>
            <div className={`flex items-center space-x-1 ${
              item.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {item.available ? (
                <>
                  <Check size={14} />
                  <span className="text-xs font-medium">Disponible</span>
                </>
              ) : (
                <>
                  <X size={14} />
                  <span className="text-xs font-medium">No disponible</span>
                </>
              )}
            </div>
          </div>
          
          <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-1 text-clean">
            {item.name}
          </h4>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 text-clean leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="ml-4 text-right">
          <div className={`text-lg font-semibold ${
            item.available 
              ? 'text-slate-800 dark:text-slate-100' 
              : 'text-slate-500 dark:text-slate-500'
          } text-clean`}>
            {formatPrice(item.price)}
          </div>
          {userType === 'funcionario' && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Precio funcionario
            </div>
          )}
          {userType === 'apoderado' && (
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Precio apoderado
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}