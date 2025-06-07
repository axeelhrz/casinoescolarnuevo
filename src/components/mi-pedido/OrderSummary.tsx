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
    <Card className="h-fit sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Resumen del Pedido
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasSelections ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No has seleccionado ningún menú</p>
            <p className="text-xs mt-1">
              {user.tipoUsuario === 'apoderado' 
                ? 'Selecciona un hijo y elige los menús para cada día'
                : 'Elige los menús para cada día de la semana'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Información sobre pedidos flexibles */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Pedidos flexibles:</strong> Puedes pagar con solo un almuerzo seleccionado. 
                Después del pago podrás agregar más días si lo deseas.
              </AlertDescription>
            </Alert>

            {/* Selecciones agrupadas por hijo */}
            <div className="space-y-4">
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
                    {/* Header del hijo/funcionario */}
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                      {isPersonal ? (
                        <>
                          <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            Pedido Personal
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Funcionario
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {child?.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {child?.curso}
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Selecciones del hijo ordenadas por fecha */}
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
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100 capitalize">
                              {getDayName(selection.date)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSelection(selection.date, child?.id)}
                              className="text-red-500 hover:text-red-700 h-auto p-1"
                              disabled={isProcessingPayment}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {selection.almuerzo && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Utensils className="w-3 h-3 text-slate-500" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  {selection.almuerzo.name}
                                </span>
                              </div>
                              <span className="text-slate-900 dark:text-slate-100 font-medium">
                                {formatPrice(selection.almuerzo.price)}
                              </span>
                            </div>
                          )}
                          
                          {selection.colacion && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-3 h-3 text-slate-500" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  {selection.colacion.name}
                                </span>
                              </div>
                              <span className="text-slate-900 dark:text-slate-100 font-medium">
                                {formatPrice(selection.colacion.price)}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Subtotal por hijo */}
                    {summary.resumenPorHijo[childKey] && (
                      <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-800 dark:text-blue-200">
                            Subtotal {isPersonal ? 'personal' : child?.name}
                          </span>
                          <span className="font-medium text-blue-900 dark:text-blue-100">
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

            {/* Resumen total */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Total Almuerzos ({summary.totalAlmuerzos})
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {formatPrice(summary.subtotalAlmuerzos)}
                </span>
              </div>
              
              {summary.totalColaciones > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Colaciones ({summary.totalColaciones})
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {formatPrice(summary.subtotalColaciones)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-slate-900 dark:text-slate-100">Total</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {formatPrice(summary.total)}
                </span>
              </div>
            </div>

            {/* Validación y botón de pago */}
            <div className="space-y-3">
              {/* Mensaje de validación */}
              {!hasAlmuerzos ? (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Debes seleccionar al menos un almuerzo para proceder con el pago.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    ¡Perfecto! Tienes {summary.totalAlmuerzos} almuerzo(s) seleccionado(s). 
                    Puedes proceder con el pago.
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {hasAlmuerzos 
                      ? `Pagar ${formatPrice(summary.total)}`
                      : 'Selecciona menús para continuar'
                    }
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                {user.tipoUsuario === 'apoderado' 
                  ? 'Al confirmar, estarás realizando el pedido para todos los hijos seleccionados'
                  : 'Al confirmar, estarás realizando tu pedido personal para la semana'
                }
              </p>

              {/* Información adicional sobre flexibilidad */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-medium">💡 Pedidos flexibles:</p>
                  <p>• Puedes pagar con solo 1 almuerzo seleccionado</p>
                  <p>• Después del pago podrás agregar más días</p>
                  <p>• Las colaciones son completamente opcionales</p>
                  <p>• No necesitas completar toda la semana</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}