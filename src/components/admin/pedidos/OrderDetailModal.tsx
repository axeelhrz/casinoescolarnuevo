"use client"
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Calendar, 
  CreditCard, 
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Package,
  DollarSign
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AdminOrderService } from '@/services/adminOrderService'
import { OrderDetailView } from '@/types/adminOrder'
import { formatAdminCurrency, formatAdminDate, formatAdminTime } from '@/lib/adminUtils'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderDetailModalProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (orderId: string, status: 'pending' | 'paid' | 'cancelled') => Promise<void>
}

export function OrderDetailModal({ 
  orderId, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: OrderDetailModalProps) {
  const [orderDetail, setOrderDetail] = useState<OrderDetailView | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const detail = await AdminOrderService.getOrderDetail(orderId)
      setOrderDetail(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el detalle')
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetail()
    } else if (!isOpen) {
      // Limpiar estado cuando se cierra el modal
      setOrderDetail(null)
      setError(null)
    }
  }, [isOpen, orderId, loadOrderDetail])

  const handleStatusUpdate = async (newStatus: 'pending' | 'paid' | 'cancelled') => {
    if (!orderId) return

    setIsUpdating(true)
    try {
      await onStatusUpdate(orderId, newStatus)
      await loadOrderDetail() // Recargar detalles
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado'
      case 'pending':
        return 'Pendiente'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getUserTypeColor = (userType: string) => {
    return userType === 'estudiante' 
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  }

  const getUserTypeLabel = (userType: string) => {
    return userType === 'estudiante' ? 'Estudiante' : 'Funcionario'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Detalle del Pedido</span>
              {orderDetail && (
                <Badge className={getStatusColor(orderDetail.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(orderDetail.status)}
                    <span>{getStatusLabel(orderDetail.status)}</span>
                  </div>
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Error al cargar el pedido
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
              <Button onClick={loadOrderDetail} className="bg-blue-600 hover:bg-blue-700">
                <Clock className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </motion.div>
          ) : orderDetail ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Grid principal con información del cliente y resumen */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del cliente */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                      <User className="w-5 h-5" />
                      <span>Información del Cliente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {orderDetail.user.firstName.charAt(0)}{orderDetail.user.lastName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {orderDetail.user.firstName} {orderDetail.user.lastName}
                        </h3>
                        <Badge className={getUserTypeColor(orderDetail.user.userType)}>
                          {getUserTypeLabel(orderDetail.user.userType)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {orderDetail.user.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">ID del pedido</p>
                          <p className="font-mono text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {orderDetail.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumen del pedido */}
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300">
                      <DollarSign className="w-5 h-5" />
                      <span>Resumen del Pedido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {orderDetail.itemsCount}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Total de items
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {orderDetail.hasColaciones ? 'Sí' : 'No'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Incluye colaciones
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total a pagar</p>
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatAdminCurrency(orderDetail.total)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalles del pedido por día */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span>Detalles del Pedido por Día</span>
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Selecciones de almuerzo y colación para cada día de la semana
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetail.selections.map((selection, index) => (
                      <motion.div
                        key={selection.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white capitalize text-lg">
                              {selection.dayName}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {formatAdminDate(selection.date)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Día {index + 1}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Almuerzo */}
                          {selection.almuerzo ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Almuerzo
                                </p>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                                    {selection.almuerzo.code}
                                  </p>
                                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {formatAdminCurrency(selection.almuerzo.price)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  {selection.almuerzo.name}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                                <p className="text-sm font-medium text-slate-500">
                                  Almuerzo
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                                <p className="text-sm text-slate-500">Sin selección</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Colación */}
                          {selection.colacion ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Colación
                                </p>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                                    {selection.colacion.code}
                                  </p>
                                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                    {formatAdminCurrency(selection.colacion.price)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                  {selection.colacion.name}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                                <p className="text-sm font-medium text-slate-500">
                                  Colación
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                                <p className="text-sm text-slate-500">Sin colación</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Información de pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span>Información de Pago</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Estado actual */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          {getStatusIcon(orderDetail.status)}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Estado actual</p>
                        <Badge className={getStatusColor(orderDetail.status)}>
                          {getStatusLabel(orderDetail.status)}
                        </Badge>
                      </div>
                      
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Clock className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Fecha de creación</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatAdminDate(orderDetail.createdAt)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatAdminTime(orderDetail.createdAt)}
                        </p>
                      </div>
                      
                      {orderDetail.paidAt ? (
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Fecha de pago</p>
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            {formatAdminDate(orderDetail.paidAt)}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {formatAdminTime(orderDetail.paidAt)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <Clock className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Estado</p>
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            Pendiente de pago
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ID de pago si existe */}
                    {orderDetail.paymentId && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">ID de transacción</p>
                        <p className="font-mono text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-2 rounded border">
                          {orderDetail.paymentId}
                        </p>
                      </div>
                    )}

                    {/* Historial de estados */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Historial de Estados
                      </h4>
                      <div className="space-y-2">
                        {orderDetail.paymentHistory.map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(payment.status)}
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {payment.status === 'created' ? 'Pedido creado' : 
                                   payment.status === 'paid' ? 'Pago confirmado' : 
                                   payment.status === 'cancelled' ? 'Pedido cancelado' : payment.status}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {formatAdminDate(payment.date)} a las {formatAdminTime(payment.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {formatAdminCurrency(payment.amount)}
                              </p>
                              {payment.method && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                                  {payment.method}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones administrativas */}
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Acciones Administrativas
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Gestiona el estado del pedido y realiza acciones administrativas
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {orderDetail.status === 'pending' && (
                      <Button
                        onClick={() => handleStatusUpdate('paid')}
                        disabled={isUpdating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Pagado
                      </Button>
                    )}
                    
                    {orderDetail.status === 'paid' && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate('pending')}
                        disabled={isUpdating}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Marcar como Pendiente
                      </Button>
                    )}
                    
                    {orderDetail.status !== 'cancelled' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate('cancelled')}
                        disabled={isUpdating}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Cancelar Pedido
                      </Button>
                    )}
                  </div>
                  
                  {isUpdating && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Actualizando estado del pedido...
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}