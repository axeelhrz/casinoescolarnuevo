"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOrderStore } from '@/store/orderStore'
import { MenuService } from '@/services/menuService'
import { User } from '@/types/panel'
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  AlertCircle, 
  Utensils, 
  Coffee,
  User as UserIcon,
  Users,
  CheckCircle,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderSummaryProps {
  user: User
  onProceedToPayment: () => void
  isProcessingPayment: boolean
}

export function OrderSummary({ user, onProceedToPayment, isProcessingPayment }: OrderSummaryProps) {
  const { 
    getOrderSummaryByChild, 
    removeSelectionByChild,
  } = useOrderStore()

  const summary = getOrderSummaryByChild()
  const hasSelections = summary.selections.length > 0
  const hasAlmuerzos = summary.totalAlmuerzos > 0

  const handleRemoveSelection = (date: string, childId?: string) => {
    removeSelectionByChild(date, childId)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Función mejorada para mostrar el nombre del día
  const getDayName = (date: string) => {
    try {
      return MenuService.getDayDisplayName(date)
    } catch (error) {
      console.error('Error formatting date:', date, error)
      return date
    }
  }

  // Agrupar selecciones por hijo
  const selectionsByChildGroup = summary.selections.reduce((acc, selection) => {
    const childKey = selection.hijo?.id || 'funcionario'
    if (!acc[childKey]) {
      acc[childKey] = []
    }
    acc[childKey].push(selection)
    return acc
  }, {} as Record<string, typeof summary.selections>)

  return (
    <Card className="h-fit sticky top-6 max-w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Resumen del Pedido</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {!hasSelections ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No has seleccionado ningún menú</p>
            <p className="text-xs leading-relaxed">
              {user.tipoUsuario === 'apoderado' 
                ? 'Selecciona un hijo y elige los menús para cada día'
                : 'Elige los menús para cada día de la semana'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Información sobre pedidos flexibles - Más compacta */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-3">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs leading-relaxed">
                <strong>Pedidos flexibles:</strong> Puedes pagar con solo un almuerzo. 
                Después podrás agregar más días.
              </AlertDescription>
            </Alert>

            {/* Selecciones agrupadas por hijo - Layout mejorado */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(selectionsByChildGroup).map(([childKey, selections]) => {
                const child = selections[0]?.hijo
                const isPersonal = childKey === 'funcionario'
                
                return (
                  <motion.div
                    key={childKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Header del hijo/funcionario - Más compacto */}
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                      {isPersonal ? (
                        <>
                          <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                            Pedido Personal
                          </span>
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 flex-shrink-0">
                            Funcionario
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                            {child?.name}
                          </span>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0">
                            {child?.curso}
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Selecciones del hijo ordenadas por fecha - Layout optimizado */}
                    <AnimatePresence>
                      {selections
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((selection) => (
                        <motion.div
                          key={`${selection.date}-${childKey}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100 capitalize truncate flex-1 mr-2">
                              {getDayName(selection.date)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSelection(selection.date, child?.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-auto p-1.5 flex-shrink-0"
                              disabled={isProcessingPayment}
                              title="Eliminar selección"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          
                          {selection.almuerzo && (
                            <div className="flex items-center justify-between text-sm gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Utensils className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                <span className="text-slate-600 dark:text-slate-400 truncate">
                                  {selection.almuerzo.name}
                                </span>
                              </div>
                              <span className="text-slate-900 dark:text-slate-100 font-medium flex-shrink-0">
                                {formatPrice(selection.almuerzo.price)}
                              </span>
                            </div>
                          )}
                          
                          {selection.colacion && (
                            <div className="flex items-center justify-between text-sm gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Coffee className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                <span className="text-slate-600 dark:text-slate-400 truncate">
                                  {selection.colacion.name}
                                </span>
                              </div>
                              <span className="text-slate-900 dark:text-slate-100 font-medium flex-shrink-0">
                                {formatPrice(selection.colacion.price)}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Subtotal por hijo - Más compacto */}
                    {summary.resumenPorHijo[childKey] && (
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-800 dark:text-blue-200 truncate flex-1 mr-2">
                            Subtotal {isPersonal ? 'personal' : child?.name}
                          </span>
                          <span className="font-medium text-blue-900 dark:text-blue-100 flex-shrink-0">
                            {formatPrice(summary.resumenPorHijo[childKey].subtotal)}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          {summary.resumenPorHijo[childKey].almuerzos} almuerzo(s) • {summary.resumenPorHijo[childKey].colaciones} colación(es)
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <Separator />

            {/* Resumen total - Layout optimizado */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">
                  Total Almuerzos ({summary.totalAlmuerzos})
                </span>
                <span className="text-slate-900 dark:text-slate-100 flex-shrink-0">
                  {formatPrice(summary.subtotalAlmuerzos)}
                </span>
              </div>
              
              {summary.totalColaciones > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">
                    Total Colaciones ({summary.totalColaciones})
                  </span>
                  <span className="text-slate-900 dark:text-slate-100 flex-shrink-0">
                    {formatPrice(summary.subtotalColaciones)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-slate-900 dark:text-slate-100 truncate flex-1 mr-2">Total</span>
                <span className="text-slate-900 dark:text-slate-100 flex-shrink-0">
                  {formatPrice(summary.total)}
                </span>
              </div>
            </div>

            {/* Validación y botón de pago */}
            <div className="space-y-3">
              {/* Mensaje de validación - Más compacto */}
              {!hasAlmuerzos ? (
                <Alert variant="destructive" className="p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <AlertDescription className="text-sm">
                    Debes seleccionar al menos un almuerzo para proceder.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                    ¡Perfecto! Tienes {summary.totalAlmuerzos} almuerzo(s) seleccionado(s).
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={onProceedToPayment}
                disabled={!hasAlmuerzos || isProcessingPayment}
                className="w-full"
                size="lg"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0" />
                    <span className="truncate">Procesando...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {hasAlmuerzos 
                        ? `Pagar ${formatPrice(summary.total)}`
                        : 'Selecciona menús para continuar'
                      }
                    </span>
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                {user.tipoUsuario === 'apoderado' 
                  ? 'Al confirmar, estarás realizando el pedido para todos los hijos seleccionados'
                  : 'Al confirmar, estarás realizando tu pedido personal para la semana'
                }
              </p>

              {/* Información adicional sobre flexibilidad - Más compacta */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-medium">💡 Pedidos flexibles:</p>
                  <p>• Puedes pagar con solo 1 almuerzo</p>
                  <p>• Después podrás agregar más días</p>
                  <p>• Las colaciones son opcionales</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}