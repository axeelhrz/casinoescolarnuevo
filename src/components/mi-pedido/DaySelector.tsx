"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DayMenuDisplay, MenuItem } from '@/types/menu'
import { User } from '@/types/panel'
import { useOrderStore } from '@/store/orderStore'
import { MenuService } from '@/services/menuService'
import { 
  Utensils, 
  Coffee, 
  Clock, 
  CheckCircle2, 
  User as UserIcon, 
  AlertCircle,
  Calendar,
  Moon,
  Sun,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DaySelectorProps {
  dayMenu: DayMenuDisplay
  user: User
  isReadOnly: boolean
}

interface MenuItemOptionProps {
  item: MenuItem
  isSelected: boolean
  isReadOnly: boolean
  isPastDay: boolean
  isWeekend: boolean
}


function MenuItemOption({ item, isSelected, isReadOnly, isPastDay, isWeekend }: MenuItemOptionProps) {
  const isDisabled = isReadOnly || !item.available || isPastDay || isWeekend

  return (
    <div className="flex items-center space-x-3">
      <RadioGroupItem 
        value={item.id} 
        id={item.id}
        disabled={isDisabled}
        className="mt-1"
      />
      <Label 
        htmlFor={item.id} 
        className={cn(
          "flex-1 cursor-pointer",
          isDisabled ? "cursor-not-allowed opacity-50" : ""
        )}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {item.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {item.code}
              </Badge>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              ${item.price.toLocaleString('es-CL')}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {item.description}
            </p>
          )}
          {!item.available && !isPastDay && !isWeekend && (
            <p className="text-xs text-red-500">No disponible</p>
          )}
        </div>
      </Label>
    </div>
  )
}

export function DaySelector({ dayMenu, user, isReadOnly }: DaySelectorProps) {
  const { 
    selectionsByChild, 
    currentChild, 
    updateSelectionByChild,
  } = useOrderStore()

  // Usar el servicio mejorado para verificar el estado del día
  const dayDate = MenuService.createLocalDate(dayMenu.date)
  const isPastDay = MenuService.isPastDay(dayMenu.date)
  const isWeekend = MenuService.isWeekend(dayMenu.date)
  const isCurrentDay = !isPastDay && !isWeekend && MenuService.formatToDateString(new Date()) === dayMenu.date
  const isFutureDay = !isPastDay && !isCurrentDay

  // Debug logging mejorado
  console.log(`DaySelector - ${dayMenu.dayLabel}:`, {
    date: dayMenu.date,
    dayDate: dayDate.toISOString(),
    isPastDay,
    isCurrentDay,
    isFutureDay,
    isWeekend,
    dayOfWeek: dayDate.getDay(),
    formattedDate: MenuService.getDayDisplayName(dayMenu.date)
  })

  // Obtener selecciones actuales para este día y hijo
  const getCurrentSelection = () => {
    if (user.tipoUsuario === 'funcionario') {
      return selectionsByChild.find(s => s.date === dayMenu.date && !s.hijo)
    } else {
      return selectionsByChild.find(s => 
        s.date === dayMenu.date && s.hijo?.id === currentChild?.id
      )
    }
  }

  const currentSelection = getCurrentSelection()
  const selectedAlmuerzo = currentSelection?.almuerzo?.id || ''
  const selectedColacion = currentSelection?.colacion?.id || ''

  const handleAlmuerzoChange = (itemId: string) => {
    if (isReadOnly || isPastDay || isWeekend) return
    
    const selectedItem = dayMenu.almuerzos.find(item => item.id === itemId)
    const targetChild = user.tipoUsuario === 'funcionario' ? null : currentChild
    
    updateSelectionByChild(
      dayMenu.date,
      'almuerzo',
      selectedItem,
      targetChild
    )
  }

  const handleColacionChange = (itemId: string) => {
    if (isReadOnly || isPastDay || isWeekend) return
    
    const selectedItem = dayMenu.colaciones.find(item => item.id === itemId)
    const targetChild = user.tipoUsuario === 'funcionario' ? null : currentChild
    
    updateSelectionByChild(
      dayMenu.date,
      'colacion',
      selectedItem,
      targetChild
    )
  }

  const removeAlmuerzo = () => {
    if (isReadOnly || isPastDay || isWeekend) return
    
    const targetChild = user.tipoUsuario === 'funcionario' ? null : currentChild
    updateSelectionByChild(dayMenu.date, 'almuerzo', undefined, targetChild)
  }

  const removeColacion = () => {
    if (isReadOnly || isPastDay || isWeekend) return
    
    const targetChild = user.tipoUsuario === 'funcionario' ? null : currentChild
    updateSelectionByChild(dayMenu.date, 'colacion', undefined, targetChild)
  }

  // Para apoderados, verificar que haya un hijo seleccionado
  const canMakeSelection = (user.tipoUsuario === 'funcionario' || currentChild) && !isPastDay && !isWeekend

  // Determinar el color y estilo del card según el estado del día
  const getCardClassName = () => {
    if (isPastDay) {
      return "h-full opacity-60 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
    }
    if (isWeekend) {
      return "h-full bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
    }
    if (isCurrentDay) {
      return "h-full border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
    }
    if (currentSelection) {
      return "h-full border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
    }
    return "h-full hover:shadow-md transition-shadow duration-200"
  }

  // Obtener icono según el día
  const getDayIcon = () => {
    if (isPastDay) return <Clock className="w-4 h-4" />
    if (isCurrentDay) return <Sun className="w-4 h-4" />
    if (isWeekend) return <Moon className="w-4 h-4" />
    return <Calendar className="w-4 h-4" />
  }

  // Obtener badge del estado
  const getDayStatusBadge = () => {
    if (isPastDay) {
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Clock className="w-3 h-3 mr-1" />
          Pasado
        </Badge>
      )
    }
    if (isWeekend) {
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          <Moon className="w-3 h-3 mr-1" />
          Fin de semana
        </Badge>
      )
    }
    if (isCurrentDay) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <Sun className="w-3 h-3 mr-1" />
          Hoy
        </Badge>
      )
    }
    if (isFutureDay && dayMenu.hasItems) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Disponible
        </Badge>
      )
    }
    return null
  }

  return (
    <Card className={getCardClassName()}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getDayIcon()}
            <span className="capitalize font-bold">{dayMenu.dayLabel}</span>
            <Badge variant="outline" className="text-xs font-medium">
              {format(dayDate, 'd \'de\' MMM', { locale: es })}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {getDayStatusBadge()}
            {currentSelection && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Seleccionado
              </Badge>
            )}
          </div>
        </CardTitle>
        
        {/* Mostrar fecha completa mejorada */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {MenuService.getDayDisplayName(dayMenu.date)}
        </div>
        
        {/* Mostrar para qué hijo es la selección */}
        {user.tipoUsuario === 'apoderado' && currentChild && !isWeekend && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <UserIcon className="w-4 h-4" />
            <span>Pedido para: <strong>{currentChild.name}</strong></span>
          </div>
        )}
        
        {user.tipoUsuario === 'funcionario' && !isWeekend && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <UserIcon className="w-4 h-4" />
            <span>Pedido personal</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {isWeekend ? (
          <div className="text-center py-8 text-purple-600 dark:text-purple-400">
            <Moon className="w-12 h-12 mx-auto mb-3 opacity-60" />
            <h3 className="font-medium text-lg mb-2">Fin de Semana</h3>
            <p className="text-sm opacity-80">
              No hay servicio de casino los fines de semana
            </p>
          </div>
        ) : !canMakeSelection && !isPastDay ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Selecciona un hijo para hacer el pedido</p>
          </div>
        ) : isPastDay ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No se pueden hacer pedidos para días pasados</p>
            {currentSelection && (
              <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <p className="text-xs font-medium mb-2">Pedido existente:</p>
                {currentSelection.almuerzo && (
                  <p className="text-xs">• {currentSelection.almuerzo.name}</p>
                )}
                {currentSelection.colacion && (
                  <p className="text-xs">• {currentSelection.colacion.name}</p>
                )}
              </div>
            )}
          </div>
        ) : !dayMenu.isAvailable ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Menú no disponible para este día</p>
          </div>
        ) : (
          <>
            {/* Sección de Almuerzos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Almuerzo <span className="text-red-500">*</span>
                  </h4>
                </div>
                {selectedAlmuerzo && !isReadOnly && !isPastDay && !isWeekend && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeAlmuerzo}
                    className="text-red-500 hover:text-red-700 h-auto p-1"
                  >
                    Quitar
                  </Button>
                )}
              </div>
              
              {dayMenu.almuerzos.length > 0 ? (
                <RadioGroup
                  value={selectedAlmuerzo || ''}
                  onValueChange={handleAlmuerzoChange}
                  disabled={isReadOnly || isPastDay || isWeekend}
                  className="space-y-2"
                >
                  {dayMenu.almuerzos.map((item) => (
                    <MenuItemOption
                      key={item.id}
                      item={item}
                      isSelected={selectedAlmuerzo === item.id}
                      isReadOnly={isReadOnly}
                      isPastDay={isPastDay}
                      isWeekend={isWeekend}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No hay opciones de almuerzo disponibles
                </p>
              )}
            </div>

            {/* Sección de Colaciones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Colación
                  </h4>
                </div>
                {selectedColacion && !isReadOnly && !isPastDay && !isWeekend && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeColacion}
                    className="text-red-500 hover:text-red-700 h-auto p-1"
                  >
                    Quitar
                  </Button>
                )}
              </div>
              
              {dayMenu.colaciones.length > 0 ? (
                <RadioGroup
                  value={selectedColacion || ''}
                  onValueChange={handleColacionChange}
                  disabled={isReadOnly || isPastDay || isWeekend}
                  className="space-y-2"
                >
                  {dayMenu.colaciones.map((item) => (
                    <MenuItemOption
                      key={item.id}
                      item={item}
                      isSelected={selectedColacion === item.id}
                      isReadOnly={isReadOnly}
                      isPastDay={isPastDay}
                      isWeekend={isWeekend}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No hay opciones de colación disponibles
                </p>
              )}
            </div>

            {/* Resumen del día */}
            {(selectedAlmuerzo || selectedColacion) && (
              <div className={cn(
                "mt-4 p-4 rounded-lg border",
                isPastDay 
                  ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  : isCurrentDay
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
              )}>
                <h5 className={cn(
                  "text-sm font-medium mb-3 flex items-center gap-2",
                  isPastDay 
                    ? "text-slate-700 dark:text-slate-300"
                    : isCurrentDay
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-emerald-900 dark:text-emerald-100"
                )}>
                  <CheckCircle2 className="w-4 h-4" />
                  Resumen del día
                </h5>
                <div className="space-y-2 text-sm">
                  {selectedAlmuerzo && (
                    <div className={cn(
                      "flex justify-between items-center",
                      isPastDay 
                        ? "text-slate-600 dark:text-slate-400"
                        : isCurrentDay
                        ? "text-blue-800 dark:text-blue-200"
                        : "text-emerald-800 dark:text-emerald-200"
                    )}>
                      <div className="flex items-center gap-2">
                        <Utensils className="w-3 h-3" />
                        <span>Almuerzo</span>
                      </div>
                      <span className="font-medium">
                        ${dayMenu.almuerzos.find(a => a.id === selectedAlmuerzo)?.price.toLocaleString('es-CL')}
                      </span>
                    </div>
                  )}
                  {selectedColacion && (
                    <div className={cn(
                      "flex justify-between items-center",
                      isPastDay 
                        ? "text-slate-600 dark:text-slate-400"
                        : isCurrentDay
                        ? "text-blue-800 dark:text-blue-200"
                        : "text-emerald-800 dark:text-emerald-200"
                    )}>
                      <div className="flex items-center gap-2">
                        <Coffee className="w-3 h-3" />
                        <span>Colación</span>
                      </div>
                      <span className="font-medium">
                        ${dayMenu.colaciones.find(c => c.id === selectedColacion)?.price.toLocaleString('es-CL')}
                      </span>
                    </div>
                  )}
                  <div className={cn(
                    "border-t pt-2 mt-3",
                    isPastDay 
                      ? "border-slate-200 dark:border-slate-700"
                      : isCurrentDay
                      ? "border-blue-200 dark:border-blue-700"
                      : "border-emerald-200 dark:border-emerald-700"
                  )}>
                    <div className={cn(
                      "flex justify-between font-semibold",
                      isPastDay 
                        ? "text-slate-700 dark:text-slate-300"
                        : isCurrentDay
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-emerald-900 dark:text-emerald-100"
                    )}>
                      <span>Total día</span>
                      <span>
                        ${((dayMenu.almuerzos.find(a => a.id === selectedAlmuerzo)?.price || 0) + 
                           (dayMenu.colaciones.find(c => c.id === selectedColacion)?.price || 0)).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}